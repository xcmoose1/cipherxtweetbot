import { TwitterApi } from 'twitter-api-v2';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};

async function generateTokens() {
    try {
        // Initialize client with app credentials
        const client = new TwitterApi({
            appKey: process.env.NEXT_PUBLIC_X_API_KEY || '',
            appSecret: process.env.NEXT_PUBLIC_X_API_SECRET || '',
        });

        // Generate authentication URL
        console.log('Generating authentication URL...');
        const authLink = await client.generateAuthLink('oob');
        
        console.log('\n1. Visit this URL in your browser:');
        console.log(authLink.url);
        console.log('\n2. Authorize the application');
        console.log('3. Enter the PIN code shown in the browser:');

        const pin = await askQuestion('PIN: ');

        // Get access tokens
        console.log('\nGetting access tokens...');
        const { accessToken, accessSecret } = await client.login(pin);

        console.log('\nSuccess! Add these tokens to your .env file:');
        console.log(`NEXT_PUBLIC_X_ACCESS_TOKEN=${accessToken}`);
        console.log(`NEXT_PUBLIC_X_ACCESS_TOKEN_SECRET=${accessSecret}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        rl.close();
    }
}

generateTokens();
