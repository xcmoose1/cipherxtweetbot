import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        
        if (!code) {
            return NextResponse.json(
                { error: 'No authorization code received' },
                { status: 400 }
            );
        }

        // Log the received code
        console.log('Received Twitter OAuth code:', code);

        // Here we'll exchange the code for access tokens
        // This will be implemented next

        // For now, redirect back to the main page
        return NextResponse.redirect(new URL('/', req.url));
    } catch (error) {
        console.error('Twitter callback error:', error);
        return NextResponse.json(
            { error: 'Failed to process Twitter callback' },
            { status: 500 }
        );
    }
}
