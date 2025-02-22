import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('twitter_access_token');
        const accessTokenSecret = cookieStore.get('twitter_access_token_secret');

        return NextResponse.json({
            isAuthenticated: !!(accessToken && accessTokenSecret)
        });
    } catch (error) {
        console.error('Error checking Twitter auth status:', error);
        return NextResponse.json({ isAuthenticated: false });
    }
}
