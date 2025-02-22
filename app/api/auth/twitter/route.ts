import { NextResponse } from 'next/server';

// OAuth 2.0 configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_X_API_KEY;
const REDIRECT_URI = 'http://localhost:3000/api/auth/twitter/callback';
const SCOPE = 'tweet.read tweet.write users.read offline.access';

export async function GET() {
    try {
        // Generate random state for security
        const state = Math.random().toString(36).substring(7);
        
        // Construct the Twitter OAuth URL
        const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', CLIENT_ID || '');
        authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.append('scope', SCOPE);
        authUrl.searchParams.append('state', state);
        authUrl.searchParams.append('code_challenge_method', 'plain');
        authUrl.searchParams.append('code_challenge', state);

        // Store state in session/cookie for verification (to be implemented)

        // Redirect to Twitter's authorization page
        return NextResponse.redirect(authUrl.toString());
    } catch (error) {
        console.error('Twitter auth error:', error);
        return NextResponse.json(
            { error: 'Failed to initiate Twitter auth' },
            { status: 500 }
        );
    }
}
