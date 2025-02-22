import axios from 'axios';
import { API_CONFIG } from './config';
import { cacheService } from './cache';

const CACHE_KEY = 'coingecko_trending_pools';
const CACHE_TTL = 240; // 4 hours in minutes

interface PoolData {
    id: string;
    attributes: {
        name: string;
        price_change_percentage: {
            h24: number;
        };
        volume_usd: {
            h24: number;
        };
    };
}

interface TokenData {
    id: string;
    attributes: {
        name: string;
        symbol: string;
    };
}

interface TrendingPoolsResponse {
    data: PoolData[];
    included: TokenData[];
}

export class CoinGeckoAPI {
    private readonly baseUrl = 'https://api.coingecko.com/api/v3';  // Using public API for now
    private readonly apiKey = API_CONFIG.COINGECKO_API_KEY;
    private readonly ttlMinutes = 5;

    async getTrendingPools(): Promise<any> {
        const cacheKey = 'coingecko_trending';
        const cachedData = await cacheService.get(cacheKey);

        if (cachedData) {
            console.log('CoinGecko: Using cached data');
            return cachedData;
        }

        try {
            console.log('CoinGecko: Fetching fresh data...');
            const response = await axios.get(
                `${this.baseUrl}/search/trending`, {
                    headers: {
                        'x-cg-demo-api-key': this.apiKey
                    }
                }
            );

            // Transform the data to match our expected structure
            const trendingCoins = response.data.coins || [];
            const data = {
                pools: trendingCoins.map((coin: any) => ({
                    attributes: {
                        name: coin.item.name,
                        price_change_percentage: {
                            h24: coin.item.data?.price_change_percentage_24h?.usd || 0
                        },
                        volume_usd: {
                            h24: coin.item.data?.total_volume?.usd || 0
                        }
                    }
                })),
                tokens: trendingCoins.map((coin: any) => ({
                    attributes: {
                        name: coin.item.name,
                        symbol: coin.item.symbol
                    }
                }))
            };

            console.log('CoinGecko: Received data:', {
                poolsCount: data.pools?.length,
                firstPool: data.pools?.[0] ? {
                    name: data.pools[0].attributes.name,
                    price_change_percentage: data.pools[0].attributes.price_change_percentage?.h24
                } : 'No pools'
            });

            // Cache the data
            await cacheService.set(cacheKey, data, this.ttlMinutes);

            return data;
        } catch (error) {
            console.error('Error fetching CoinGecko data:', error);
            throw error;
        }
    }

    getPoolInsights(pool: PoolData): {
        name: string;
        priceChange24h: number;
        volume24h: number;
        buyPressure: number;
        liquidity: number;
    } {
        const attributes = pool.attributes;
        
        // Calculate buy pressure (ratio of buys to total transactions in last hour)
        const buyPressure = 0; // Removed hourlyTx as it's not available in the new API

        return {
            name: attributes.name,
            priceChange24h: attributes.price_change_percentage.h24,
            volume24h: attributes.volume_usd.h24,
            buyPressure,
            liquidity: 0 // Removed reserve_in_usd as it's not available in the new API
        };
    }

    formatPoolStats(pool: PoolData): string {
        const insights = this.getPoolInsights(pool);
        const buyPressureEmoji = insights.buyPressure > 50 ? '🟢' : '🔴';
        
        return `${pool.attributes.name}
Volume 24h: $${(insights.volume24h / 1e6).toFixed(2)}M
Price Change: ${insights.priceChange24h > 0 ? '📈' : '📉'} ${insights.priceChange24h.toFixed(2)}%
Buy Pressure: ${buyPressureEmoji} ${insights.buyPressure.toFixed(1)}%
Liquidity: $${(insights.liquidity / 1e6).toFixed(2)}M`;
    }

    getMarketSentiment(pools: PoolData[]): {
        overallSentiment: 'bullish' | 'bearish' | 'neutral';
        averageBuyPressure: number;
        totalVolume24h: number;
        topPerformer: string;
        topVolume: string;
    } {
        let totalBuyPressure = 0;
        let totalVolume24h = 0;
        let bestPriceChange = -Infinity;
        let highestVolume = -Infinity;
        let topPerformer = '';
        let topVolumePool = '';

        pools.forEach(pool => {
            const insights = this.getPoolInsights(pool);
            totalBuyPressure += insights.buyPressure;
            totalVolume24h += insights.volume24h;

            if (insights.priceChange24h > bestPriceChange) {
                bestPriceChange = insights.priceChange24h;
                topPerformer = pool.attributes.name;
            }

            if (insights.volume24h > highestVolume) {
                highestVolume = insights.volume24h;
                topVolumePool = pool.attributes.name;
            }
        });

        const averageBuyPressure = totalBuyPressure / pools.length;
        const overallSentiment = averageBuyPressure > 55 ? 'bullish' : 
                               averageBuyPressure < 45 ? 'bearish' : 
                               'neutral';

        return {
            overallSentiment,
            averageBuyPressure,
            totalVolume24h,
            topPerformer,
            topVolume: topVolumePool
        };
    }
}

export const coinGecko = new CoinGeckoAPI();
