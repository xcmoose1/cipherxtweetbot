import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/services/config';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { cookies } from 'next/headers';

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
        if (!API_CONFIG.X_API_KEY || !API_CONFIG.X_API_SECRET) {
            console.error('Twitter API credentials not configured');
            return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?error=api_not_configured`);
        }

        const { searchParams } = new URL(req.url);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');
        
        console.log('Callback params:', { oauthToken, oauthVerifier }); // Debug log
        
        if (!oauthToken || !oauthVerifier) {
            console.error('Missing oauth_token or oauth_verifier');
            return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?error=invalid_callback`);
        }

        // Exchange request token for access token
        const accessTokenURL = 'https://api.twitter.com/oauth/access_token';
        const authHeader = oauth.toHeader(oauth.authorize({
            url: accessTokenURL,
            method: 'POST',
            data: {
                oauth_token: oauthToken,
                oauth_verifier: oauthVerifier
            }
        }))['Authorization'];

        console.log('Access token request:', { url: accessTokenURL, authHeader }); // Debug log

        const response = await fetch(accessTokenURL, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `oauth_token=${oauthToken}&oauth_verifier=${oauthVerifier}`
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Twitter access token error:', error);
            return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?error=access_token_failed`);
        }

        const responseText = await response.text();
        console.log('Access token response:', responseText); // Debug log

        const accessTokenParams = new URLSearchParams(responseText);
        const accessToken = accessTokenParams.get('oauth_token');
        const accessTokenSecret = accessTokenParams.get('oauth_token_secret');
        const userId = accessTokenParams.get('user_id');
        const screenName = accessTokenParams.get('screen_name');

        if (!accessToken || !accessTokenSecret) {
            console.error('Missing access token or secret:', responseText);
            return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?error=invalid_tokens`);
        }

        // Store tokens in cookies
        const cookieStore = await cookies();
        cookieStore.set('twitter_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });
        cookieStore.set('twitter_access_token_secret', accessTokenSecret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        // Store user info
        if (userId && screenName) {
            cookieStore.set('twitter_user_id', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60
            });
            cookieStore.set('twitter_screen_name', screenName, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60
            });
        }

        console.log('Authentication successful for user:', screenName); // Debug log

        return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?success=true`);
    } catch (error) {
        console.error('Twitter callback error:', error);
        return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard?error=auth_failed`);
    }
}
