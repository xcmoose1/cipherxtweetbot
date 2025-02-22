import axios from 'axios';
import { API_CONFIG } from './config';
import { cacheService } from './cache';

const CACHE_KEY = 'lunarcrush_data';
const CACHE_TTL = 240; // 4 hours in minutes

interface Blockchain {
    network: string;
    address: string;
    decimals: number;
}

export interface CoinData {
    id: string;
    symbol: string;
    name: string;
    price: number;
    price_btc: number;
    volume_24h: number;
    volatility: number;
    circulating_supply: number;
    max_supply: number | null;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    market_cap: number;
    market_cap_rank: number;
    interactions_24h: number;
    social_volume_24h: number;
    social_dominance: number;
    market_dominance: number;
    galaxy_score: number;
    galaxy_score_previous: number;
    alt_rank: number;
    alt_rank_previous: number;
    sentiment: number;
    blockchains: Blockchain[];
    topic: string;
    logo: string;
}

export class LunarCrushAPI {
    private readonly baseUrl = 'https://lunarcrush.com/api4';
    private readonly apiKey = API_CONFIG.LUNARCRUSH_API_KEY;

    async getTopCoinsBySentiment(limit: number = 20): Promise<CoinData[]> {
        // Check cache first
        const cachedData = await cacheService.get<CoinData[]>(CACHE_KEY);
        if (cachedData) {
            console.log('LunarCrush: Using cached data');
            return cachedData;
        }

        try {
            console.log('LunarCrush: Fetching fresh data...');
            const response = await axios.get<{ data: CoinData[] }>(
                `${this.baseUrl}/public/coins/list/v2`, {
                    params: {
                        sort: 'sentiment'
                    },
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            const coins = response.data.data;
            console.log('LunarCrush: Received data:', { 
                coinsCount: coins?.length,
                firstCoin: coins?.[0] ? {
                    name: coins[0].name,
                    sentiment: coins[0].sentiment
                } : 'No coins'
            });
            
            // Cache the data
            await cacheService.set(CACHE_KEY, coins, CACHE_TTL);

            return coins;
        } catch (error) {
            console.error('Error fetching LunarCrush data:', error);
            throw error;
        }
    }

    async getMarketInsights(): Promise<{
        topGainers: CoinData[];
        topSentiment: CoinData[];
        topSocial: CoinData[];
    }> {
        try {
            const coins = await this.getTopCoinsBySentiment(50);

            // Sort coins by different metrics
            const topGainers = [...coins]
                .sort((a, b) => b.percent_change_24h - a.percent_change_24h)
                .slice(0, 5);

            const topSentiment = [...coins]
                .sort((a, b) => b.sentiment - a.sentiment)
                .slice(0, 5);

            const topSocial = [...coins]
                .sort((a, b) => b.social_volume_24h - a.social_volume_24h)
                .slice(0, 5);

            return {
                topGainers,
                topSentiment,
                topSocial
            };
        } catch (error) {
            console.error('Error getting market insights:', error);
            throw error;
        }
    }

    async getTopCoinsBySentimentNew(): Promise<any> {
        const cacheKey = 'lunarcrush_sentiment';
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
            console.log('LunarCrush: Using cached data');
            return cachedData;
        }

        try {
            console.log('LunarCrush: Fetching fresh data...');
            const response = await axios.get(`${this.baseUrl}/public/coins/list/v2`, {
                params: {
                    sort: 'sentiment',
                    limit: 10
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            const data = response.data.data;
            
            // Transform data for our needs
            const transformedData = data.map((coin: any) => ({
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                sentiment: (coin.sentiment_relative_score * 100).toFixed(0),
                image: coin.image
            }));

            console.log('LunarCrush: Received data:', {
                coinsCount: transformedData.length,
                firstCoin: transformedData[0]
            });

            cacheService.set(cacheKey, transformedData, 5);
            return transformedData;
        } catch (error: any) {
            console.error('LunarCrush API Error:', {
                message: error.message,
                response: error.response?.data
            });
            throw new Error('Failed to fetch sentiment data from LunarCrush');
        }
    }

    formatCoinData(coin: CoinData): string {
        return `${coin.name} ($${coin.symbol})
Price: $${coin.price.toFixed(4)}
24h Change: ${coin.percent_change_24h.toFixed(2)}%
Sentiment: ${coin.sentiment}%
Social Volume: ${coin.social_volume_24h}
Galaxy Score: ${coin.galaxy_score}`;
    }

    getSentimentEmoji(sentiment: number): string {
        if (sentiment >= 75) return '🚀';
        if (sentiment >= 60) return '📈';
        if (sentiment >= 40) return '➡️';
        if (sentiment >= 25) return '📉';
        return '⚠️';
    }

    getChangeEmoji(change: number): string {
        if (change >= 10) return '🔥';
        if (change >= 5) return '📈';
        if (change >= -5) return '➡️';
        if (change >= -10) return '📉';
        return '💧';
    }
}

export const lunarCrush = new LunarCrushAPI();
