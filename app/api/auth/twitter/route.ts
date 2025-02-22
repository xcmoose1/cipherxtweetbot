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
        if (!API_CONFIG.X_API_KEY || !API_CONFIG.X_API_SECRET) {
            console.error('Twitter API credentials not configured');
            return NextResponse.json({ error: 'Twitter API not configured' }, { status: 500 });
        }

        // Request token URL (v1.1 API)
        const requestTokenURL = 'https://api.twitter.com/oauth/request_token';
        const callbackURL = `${API_CONFIG.APP_URL}/api/auth/twitter/callback`;

        console.log('Using callback URL:', callbackURL); // Debug log

        // Generate request token
        const authHeader = oauth.toHeader(oauth.authorize({
            url: requestTokenURL,
            method: 'POST',
            data: { oauth_callback: callbackURL }
        }))['Authorization'];

        console.log('Auth header:', authHeader); // Debug log

        const response = await fetch(requestTokenURL, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `oauth_callback=${encodeURIComponent(callbackURL)}`
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Twitter request token error:', error);
            return NextResponse.json({ error: 'Failed to get request token' }, { status: response.status });
        }

        const responseText = await response.text();
        console.log('Twitter response:', responseText); // Debug log

        const urlParams = new URLSearchParams(responseText);
        const oauthToken = urlParams.get('oauth_token');

        if (!oauthToken) {
            console.error('No oauth_token in response:', responseText);
            return NextResponse.json({ error: 'Invalid response from Twitter' }, { status: 500 });
        }

        // Return the authorization URL
        const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
        return NextResponse.json({ url: authUrl });
    } catch (error) {
        console.error('Twitter auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
