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
            secret: API_CONFIG.TWITTER_ACCESS_SECRET
        };

        // Add OAuth specific parameters
        const oauth_data = {
            oauth_consumer_key: API_CONFIG.TWITTER_API_KEY,
            oauth_nonce: this.generateNonce(),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: this.getTimestamp(),
            oauth_token: token.key,
            oauth_version: '1.0'
        };

        const request_data = {
            url,
            method,
            data: {
                ...data,
                ...oauth_data
            }
        };

        // Log request data for debugging (without exposing secrets)
        console.log('Twitter OAuth Request:', {
            url,
            method,
            oauth_nonce: oauth_data.oauth_nonce,
            oauth_timestamp: oauth_data.oauth_timestamp,
            hasConsumerKey: !!API_CONFIG.TWITTER_API_KEY,
            hasConsumerSecret: !!API_CONFIG.TWITTER_API_SECRET,
            hasAccessToken: !!API_CONFIG.TWITTER_ACCESS_TOKEN,
            hasAccessSecret: !!API_CONFIG.TWITTER_ACCESS_SECRET
        });

        const authorization = this.oauth.authorize(request_data, token);
        const header = this.oauth.toHeader(authorization);
        return header.Authorization;
    }
}

export const twitter = new TwitterAPI();
