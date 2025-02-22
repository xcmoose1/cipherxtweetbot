import { CoinData } from '../services/lunarCrush';

export type TweetType = 'MARKET_TRENDS' | 'HYPE' | 'GEM_ALERT' | 'MEMECOINS' | 'DEFI' | 'SENTIMENT';

export interface TweetMetrics {
    topCoins: CoinData[];
    trendingPools: Pool[];
    sentiment?: number;
    socialVolume?: number;
}

export interface Pool {
    id: string;
    attributes: {
        name: string;
        volume_usd: {
            h24: string;
        };
        price_change_percentage: {
            h24: string;
        };
        reserve_in_usd: string;
        transactions: {
            h1: {
                buys: number;
                sells: number;
                buyers: number;
                sellers: number;
            };
        };
    };
    relationships: {
        dex: {
            data: {
                id: string;
            };
        };
    };
}

export interface Tweet {
    id: string;
    type: TweetType;
    content: string;
    timestamp: number;
    metrics: TweetMetrics;
}
