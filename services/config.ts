export const API_CONFIG = {
    COINGECKO_API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '',
    LUNARCRUSH_API_KEY: process.env.NEXT_PUBLIC_LUNARCRUSH_API_KEY || '',
    OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    X_API_KEY: process.env.NEXT_PUBLIC_X_API_KEY || '',
    X_API_SECRET: process.env.NEXT_PUBLIC_X_API_SECRET || '',
    X_ACCESS_TOKEN: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN || '',
    X_ACCESS_TOKEN_SECRET: process.env.NEXT_PUBLIC_X_ACCESS_TOKEN_SECRET || '',
    UPDATE_INTERVAL: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    RETRY_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
};
