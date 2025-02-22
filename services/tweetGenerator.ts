import axios from 'axios';
import { API_CONFIG } from './config';
import { lunarCrush, CoinData } from './lunarCrush';
import { coinGecko } from './coinGecko';
import { Tweet, TweetType } from '@/types/tweet';

interface TweetData extends Tweet {
    approved: boolean;
    posted: boolean;
}

class TweetGenerator {
    private pendingTweets: TweetData[] = [];

    async generateTweet(marketData: CoinData[], poolData: any): Promise<string> {
        try {
            // Get top coins by different metrics
            const topSentiment = marketData.sort((a, b) => b.sentiment - a.sentiment)[0];
            const topGainer = marketData.sort((a, b) => b.percent_change_24h - a.percent_change_24h)[0];
            const topSocial = marketData.sort((a, b) => b.social_volume_24h - a.social_volume_24h)[0];

            // Get pool insights
            const poolSentiment = coinGecko.getMarketSentiment(poolData.pools);
            const topPool = poolData.pools[0];
            const poolStats = coinGecko.getPoolInsights(topPool);

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are GPT-4o Mini, a specialized crypto market insights generator. Create engaging tweets for CipherX, a crypto intelligence platform that posts market insights and social sentiment trends. Use emojis, hashtags, and an engaging hook. Maximum 280 characters."
                        },
                        {
                            role: "user",
                            content: `Create an engaging tweet based on these market insights:

                            Top Sentiment Coin: ${topSentiment.name} ($${topSentiment.symbol})
                            - Sentiment Score: ${topSentiment.sentiment}%
                            - 24h Change: ${topSentiment.percent_change_24h}%
                            - Social Volume: ${topSentiment.social_volume_24h}

                            Top Gainer: ${topGainer.name} ($${topGainer.symbol})
                            - 24h Change: ${topGainer.percent_change_24h}%
                            - Price: $${topGainer.price}
                            - Volume: $${topGainer.volume_24h}

                            Top Social Activity: ${topSocial.name} ($${topSocial.symbol})
                            - Social Volume: ${topSocial.social_volume_24h}
                            - Sentiment: ${topSocial.sentiment}%
                            - 24h Change: ${topSocial.percent_change_24h}%

                            Market Sentiment: ${poolSentiment.overallSentiment}
                            Top Pool: ${poolStats.name}
                            - 24h Volume: $${(poolStats.volume24h / 1e6).toFixed(2)}M
                            - Price Change: ${poolStats.priceChange24h.toFixed(2)}%
                            - Buy Pressure: ${poolStats.buyPressure.toFixed(1)}%`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 100,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating tweet:', error);
            throw new Error('Failed to generate tweet');
        }
    }

    async createPendingTweet(): Promise<TweetData> {
        const [marketData, poolData] = await Promise.all([
            lunarCrush.getTopCoinsBySentiment(20),
            coinGecko.getTrendingPools()
        ]);

        const tweet = await this.generateTweet(marketData, poolData);
        
        const tweetData: TweetData = {
            id: Math.random().toString(36).substring(7),
            content: tweet,
            type: 'MARKET_TRENDS',
            timestamp: Date.now(),
            metrics: {
                topCoins: marketData.slice(0, 5),
                trendingPools: poolData.pools.slice(0, 3),
                sentiment: marketData[0].sentiment,
                socialVolume: marketData[0].social_volume_24h
            },
            approved: false,
            posted: false
        };

        this.pendingTweets.push(tweetData);
        // Keep only last 10 pending tweets
        if (this.pendingTweets.length > 10) {
            this.pendingTweets.shift();
        }

        return tweetData;
    }

    getPendingTweets(): TweetData[] {
        // Remove tweets older than 30 minutes
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        this.pendingTweets = this.pendingTweets.filter(
            tweet => tweet.timestamp > thirtyMinutesAgo && !tweet.posted
        );
        return this.pendingTweets.filter(t => !t.posted && !t.approved);
    }

    approveTweet(tweetId: string): TweetData | null {
        const tweet = this.pendingTweets.find(t => t.id === tweetId);
        if (tweet) {
            tweet.approved = true;
            return tweet;
        }
        return null;
    }

    markTweetAsPosted(tweetId: string) {
        const tweet = this.pendingTweets.find(t => t.id === tweetId);
        if (tweet) {
            tweet.posted = true;
        }
    }

    addTweet(content: string, type: TweetType = 'MARKET_TRENDS'): void {
        const tweet: TweetData = {
            id: Math.random().toString(36).substring(7),
            content,
            type,
            timestamp: Date.now(),
            metrics: {
                topCoins: [],
                trendingPools: []
            },
            approved: false,
            posted: false
        };
        this.pendingTweets.push(tweet);
    }

    getLatestTweet(): TweetData | null {
        return this.pendingTweets[this.pendingTweets.length - 1] || null;
    }
}

export const tweetGenerator = new TweetGenerator();
