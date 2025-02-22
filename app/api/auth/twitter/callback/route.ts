import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/services/config';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
            return NextResponse.redirect(`${API_CONFIG.APP_URL}?error=no_code`);
        }

        // Verify state parameter (to be implemented)
        if (!state) {
            return NextResponse.redirect(`${API_CONFIG.APP_URL}?error=invalid_state`);
        }

        // Log the received code
        console.log('Received Twitter OAuth code:', code);

        // Here we'll exchange the code for access tokens
        // This will be implemented next

        // For now, redirect back to the main page
        return NextResponse.redirect(`${API_CONFIG.APP_URL}/dashboard`);
    } catch (error) {
        console.error('Twitter callback error:', error);
        return NextResponse.redirect(`${API_CONFIG.APP_URL}?error=callback_failed`);
    }
}
