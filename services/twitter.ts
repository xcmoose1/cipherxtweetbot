import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { API_CONFIG } from './config';

export class TwitterAPI {
    private readonly oauth: OAuth;
    private readonly baseUrl = 'https://api.twitter.com/2';

    constructor() {
        this.oauth = new OAuth({
            consumer: {
                key: API_CONFIG.TWITTER_API_KEY,
                secret: API_CONFIG.TWITTER_API_SECRET
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            }
        });
    }

    private generateNonce(): string {
        return crypto.randomBytes(32).toString('base64')
            .replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
    }

    private getTimestamp(): string {
        return Math.floor(Date.now() / 1000).toString();
    }

    public generateAuthHeader(method: string, url: string, data: any = {}): string {
        const token = {
            key: API_CONFIG.TWITTER_ACCESS_TOKEN,
            secret: API_CONFIG.TWITTER_ACCESS_TOKEN_SECRET
        };

        const request_data = {
            url,
            method,
            data
        };

        const authorization = this.oauth.authorize(request_data, token);
        return this.oauth.toHeader(authorization)['Authorization'];
    }

    async postTweet(text: string): Promise<any> {
        const url = `${this.baseUrl}/tweets`;
        const method = 'POST';
        const data = { text };

        const headers = {
            'Authorization': this.generateAuthHeader(method, url, data),
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Twitter API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error posting tweet:', error);
            throw error;
        }
    }
}

export const twitter = new TwitterAPI();
