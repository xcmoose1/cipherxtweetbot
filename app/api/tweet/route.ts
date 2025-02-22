import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

const TWITTER_API_URL = 'https://api.twitter.com/2/tweets';

// OAuth 1.0a credentials
const oauth = new OAuth({
    consumer: {
        key: process.env.NEXT_PUBLIC_X_API_KEY || '',
        secret: process.env.NEXT_PUBLIC_X_API_SECRET || ''
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64');
    }
});

export async function POST(req: Request) {
    try {
        // Check OAuth credentials
        if (!process.env.NEXT_PUBLIC_X_API_KEY || 
            !process.env.NEXT_PUBLIC_X_API_SECRET || 
            !process.env.NEXT_PUBLIC_X_ACCESS_TOKEN || 
            !process.env.NEXT_PUBLIC_X_ACCESS_TOKEN_SECRET) {
            console.error('Missing Twitter OAuth credentials');
            return NextResponse.json(
                { error: 'Twitter API configuration missing' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { text } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Tweet text is required and must be a string' },
                { status: 400 }
            );
        }

        if (text.length > 280) {
            return NextResponse.json(
                { error: `Tweet text must be 280 characters or less (got ${text.length})` },
                { status: 400 }
            );
        }

        console.log('Attempting to post tweet:', {
            textPreview: text.substring(0, 50) + '...',
            length: text.length
        });

        // Prepare the request
        const request_data = {
            url: TWITTER_API_URL,
            method: 'POST'
        };

        // Generate OAuth headers
        const token = {
            key: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN || '',
            secret: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN_SECRET || ''
        };

        const headers = oauth.toHeader(oauth.authorize(request_data, token));

        // Make the request to Twitter API
        const response = await axios.post(
            TWITTER_API_URL,
            { text },
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Twitter API response:', {
            status: response.status,
            data: response.data
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Twitter API error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
            return NextResponse.json(
                { error: 'Twitter authentication failed. Please check your OAuth credentials.' },
                { status: 401 }
            );
        }

        if (error.response?.status === 429) {
            return NextResponse.json(
                { error: 'Twitter API rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error.response?.data?.detail || 'Failed to post tweet' },
            { status: error.response?.status || 500 }
        );
    }
}
