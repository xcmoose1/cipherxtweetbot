import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/services/config';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

// Create OAuth 1.0a instance
const oauth = new OAuth({
    consumer: {
        key: API_CONFIG.X_API_KEY,
        secret: API_CONFIG.X_API_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
    }
});

export async function GET() {
    try {
        // Request token URL
        const requestTokenURL = 'https://api.twitter.com/oauth/request_token';
        const callbackURL = `${API_CONFIG.APP_URL}/api/auth/twitter/callback`;

        // Generate request token
        const response = await fetch(requestTokenURL + '?oauth_callback=' + encodeURIComponent(callbackURL), {
            method: 'POST',
            headers: {
                'Authorization': oauth.toHeader(oauth.authorize({
                    url: requestTokenURL,
                    method: 'POST'
                }))['Authorization']
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get request token: ${response.statusText}`);
        }

        const responseText = await response.text();
        const urlParams = new URLSearchParams(responseText);
        const oauthToken = urlParams.get('oauth_token');

        if (!oauthToken) {
            throw new Error('No oauth_token in response');
        }

        // Redirect to Twitter authorization page
        const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Twitter auth error:', error);
        return NextResponse.redirect(`${API_CONFIG.APP_URL}?error=auth_failed`);
    }
}
