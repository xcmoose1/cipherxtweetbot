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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');
        
        if (!oauthToken || !oauthVerifier) {
            return NextResponse.redirect(`${API_CONFIG.APP_URL}?error=invalid_callback`);
        }

        // Exchange request token for access token
        const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
        const response = await fetch(
            `${accessTokenURL}?oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': oauth.toHeader(oauth.authorize({
                        url: accessTokenURL,
                        method: 'POST'
                    }))['Authorization']
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get access token: ${response.statusText}`);
        }

        const responseText = await response.text();
        const accessTokenParams = new URLSearchParams(responseText);
        const accessToken = accessTokenParams.get('oauth_token');
        const accessTokenSecret = accessTokenParams.get('oauth_token_secret');
        const screenName = accessTokenParams.get('screen_name');

        if (!accessToken || !accessTokenSecret) {
            throw new Error('Failed to get access token or secret');
        }

        // Here you would typically store these tokens securely
        console.log('Successfully authenticated user:', screenName);

        // Redirect to dashboard with success message
        return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?success=true`);
    } catch (error) {
        console.error('Twitter callback error:', error);
        return NextResponse.redirect(`${API_CONFIG.APP_URL}?error=auth_failed`);
    }
}
