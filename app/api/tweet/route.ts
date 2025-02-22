import { NextResponse } from 'next/server';
import { tweetBot } from '@/services/tweetBot';

interface ErrorResponse {
    message: string;
    status: number;
    details?: Record<string, unknown>;
}

export async function POST() {
    try {
        await tweetBot.manualTweet();
        return NextResponse.json({ success: true });
    } catch (error) {
        const err = error as ErrorResponse;
        console.error('Error posting tweet:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to post tweet' },
            { status: err.status || 500 }
        );
    }
}
