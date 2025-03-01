import axios from 'axios';
import { API_CONFIG } from './config';
import { cacheService } from './cache';

export class OpenAIService {
    private readonly baseUrl = 'https://api.openai.com/v1';
    private readonly ttlMinutes = 60;

    async generateTweetTemplate(context: string): Promise<string> {
        const cacheKey = `tweet_template_${context}`;
        const cachedData = cacheService.get<string>(cacheKey);

        if (cachedData) {
            console.log('OpenAI: Using cached template');
            return this.ensureValidTweet(cachedData);
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are a crypto market analyst crafting engaging tweets. Your tweets MUST be under 280 characters, including emojis and hashtags. Keep it concise but informative. Use max 2-3 hashtags."
                        },
                        {
                            role: "user",
                            content: `Create a tweet based on this market data. Remember to keep it under 280 characters:\n${context}`
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const tweet = response.data.choices[0].message.content.trim();
            
            // Validate and potentially truncate the tweet
            const validTweet = this.ensureValidTweet(tweet);
            
            cacheService.set<string>(cacheKey, validTweet, this.ttlMinutes);
            return validTweet;
        } catch (error: any) {
            console.error('OpenAI: Error generating tweet template:', error.message);
            throw new Error('Failed to generate tweet template');
        }
    }

    private ensureValidTweet(tweet: string): string {
        // Remove extra whitespace and newlines
        let cleanTweet = tweet.replace(/\s+/g, ' ').trim();
        
        // Remove quotes if present
        if (cleanTweet.startsWith('"') && cleanTweet.endsWith('"')) {
            cleanTweet = cleanTweet.slice(1, -1).trim();
        }
        
        // Truncate if too long
        if (cleanTweet.length > 280) {
            cleanTweet = cleanTweet.slice(0, 277) + '...';
        }
        
        return cleanTweet;
    }
}

// Export a singleton instance
export const openai = new OpenAIService();
