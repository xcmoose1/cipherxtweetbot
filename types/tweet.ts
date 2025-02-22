export type TweetType = 'MARKET_TRENDS' | 'HYPE' | 'GEM_ALERT';

export interface Tweet {
    id: string;
    type: TweetType;
    content: string;
    timestamp: number;
    metrics?: {
        likes: number;
        retweets: number;
        replies: number;
    };
}
