import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/services/config';

export async function GET() {
    const envVars = {
        hasApiKey: !!API_CONFIG.X_API_KEY,
        hasApiSecret: !!API_CONFIG.X_API_SECRET,
        appUrl: API_CONFIG.APP_URL,
        // Don't expose actual keys, just whether they exist
        apiKeyLength: API_CONFIG.X_API_KEY?.length || 0,
        apiSecretLength: API_CONFIG.X_API_SECRET?.length || 0,
    };
    
    return NextResponse.json(envVars);
}
