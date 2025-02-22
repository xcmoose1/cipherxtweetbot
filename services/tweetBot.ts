import axios from 'axios';
import { API_CONFIG } from './config';
import { coinGecko } from './coinGecko';
import { lunarCrush } from './lunarCrush';
import { openai } from './openai';

const TWEET_GENERATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export class TweetBotService {
    private isGenerating = false;
    private lastTweetTime: Date | null = null;
    private interval: NodeJS.Timeout | null = null;

    constructor() {}

    async generateTweet(): Promise<string> {
        try {
            console.log('TweetBot: Starting tweet generation...');
            
            console.log('TweetBot: Fetching market data...');
            const [marketData, sentimentData] = await Promise.all([
                coinGecko.getTrendingPools(),
                lunarCrush.getTopCoinsBySentiment()
            ]);

            // Extract relevant data
            const context = this.prepareContext(marketData, sentimentData);
            console.log('TweetBot: Generated context:', context);

            // Generate tweet using OpenAI
            const tweet = await openai.generateTweetTemplate(context);
            console.log('TweetBot: Generated tweet:', {
                text: tweet,
                length: tweet.length
            });

            return tweet;
        } catch (error) {
            console.error('TweetBot: Failed to generate tweet:', error);
            throw new Error('Failed to generate tweet. Please try again.');
        }
    }

    private prepareContext(marketData: any, sentimentData: any): string {
        try {
            const topTrending = marketData?.pools?.[0]?.attributes;
            const topSentiment = sentimentData?.[0];

            if (!topTrending || !topSentiment) {
                throw new Error('Missing data from APIs');
            }

            return `Market Update:
- Top Trending: ${topTrending.name} (prev. ${topTrending.previousSymbol}) (${topTrending.priceChangePercentage24h}% 24h)
- Highest Sentiment: ${topSentiment.name} (${topSentiment.sentiment}% positive)
- 24h Volume: $${topTrending.volume24h}M`;
        } catch (error) {
            console.error('TweetBot: Error preparing context:', error);
            throw new Error('Failed to prepare tweet context');
        }
    }

    async postTweet(text: string): Promise<any> {
        try {
            // Input validation
            if (!text || typeof text !== 'string') {
                const error = new Error('Text is required and must be a string');
                console.error('TweetBot: Invalid input:', { text });
                throw error;
            }

            if (text.length > 280) {
                const error = new Error(`Tweet is too long (${text.length} characters). Maximum is 280.`);
                console.error('TweetBot: Text too long:', {
                    text: text.substring(0, 50) + '...',
                    length: text.length
                });
                throw error;
            }

            // Log the tweet attempt
            console.log('TweetBot: Attempting to post tweet:', {
                text: text.substring(0, 50) + '...',
                length: text.length
            });

            const response = await axios.post('/api/tweet', { text }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Log success
            console.log('TweetBot: Tweet posted successfully:', {
                data: response.data,
                status: response.status
            });
            return response.data;
        } catch (error: any) {
            // If it's our validation error, just throw it
            if (error.message.includes('Tweet is too long') || 
                error.message.includes('Text is required')) {
                throw error;
            }

            // For API errors, log and throw a user-friendly message
            console.error('TweetBot: Error posting tweet:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            if (error.response?.status === 400) {
                throw new Error('Invalid tweet request: ' + (error.response?.data?.error || 'Please check your input'));
            }

            if (error.response?.status === 401) {
                throw new Error('Twitter authentication failed. Please check API configuration.');
            }

            if (error.response?.status === 429) {
                throw new Error('Twitter rate limit exceeded. Please try again later.');
            }

            throw new Error('Failed to post tweet. Please try again.');
        }
    }

    async manualTweet(text?: string): Promise<void> {
        if (!this.isTimeToTweet()) {
            throw new Error('Please wait 4 hours between tweets');
        }

        if (this.isGenerating) {
            throw new Error('Tweet generation already in progress');
        }

        try {
            this.isGenerating = true;
            const tweetText = text || await this.generateTweet();
            
            // Log the tweet we're about to post
            console.log('TweetBot: Manual tweet request:', {
                text: tweetText.substring(0, 50) + '...',
                length: tweetText.length,
                isGenerated: !text
            });

            await this.postTweet(tweetText);
            console.log('TweetBot: Manual tweet successful');
        } catch (error: any) {
            console.error('TweetBot: Manual tweet failed:', {
                error: error.message,
                stack: error.stack
            });
            throw error; // Re-throw so UI can handle it
        } finally {
            this.isGenerating = false;
        }
    }

    start(): void {
        if (this.interval) {
            return; // Already started
        }

        console.log('TweetBot: Starting automatic tweet generation...');
        
        // Generate first tweet immediately
        this.generateAndPostTweet();

        // Set up interval for subsequent tweets
        this.interval = setInterval(() => {
            this.generateAndPostTweet();
        }, TWEET_GENERATION_INTERVAL);
    }

    stop(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('TweetBot: Stopped automatic tweet generation');
        }
    }

    private async generateAndPostTweet(): Promise<void> {
        if (this.isGenerating) {
            console.log('TweetBot: Already generating a tweet, skipping...');
            return;
        }

        try {
            this.isGenerating = true;
            const tweet = await this.generateTweet();
            await this.manualTweet(tweet);
            this.lastTweetTime = new Date();
            console.log('TweetBot: Successfully generated and posted tweet');
        } catch (error) {
            console.error('TweetBot: Failed to generate and post tweet:', error);
        } finally {
            this.isGenerating = false;
        }
    }

    getLastTweetTime(): Date | null {
        return this.lastTweetTime;
    }

    isTimeToTweet(): boolean {
        if (!this.lastTweetTime) return true;
        
        const now = new Date();
        const timeSinceLastTweet = now.getTime() - this.lastTweetTime.getTime();
        return timeSinceLastTweet >= TWEET_GENERATION_INTERVAL;
    }
}

// Export a singleton instance
export const tweetBot = new TweetBotService();
