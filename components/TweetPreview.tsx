import { useState, useEffect } from 'react';
import { TweetType, Tweet, Pool } from '@/types/tweet';
import { tweetGenerator } from '@/services/tweetGenerator';
import { tweetBot } from '@/services/tweetBot';
import { CoinData } from '@/services/lunarCrush';
import Image from 'next/image';

interface TweetError {
    message: string;
    response?: {
        status: number;
        data?: {
            error?: string;
        };
    };
}

interface TweetPreviewProps {
    selectedTypes: TweetType[];
    frequency: number;
    onApprove?: (tweetId: string) => void;
}

const sampleTweets: Record<TweetType, string[]> = {
    MARKET_TRENDS: [
        " #Bitcoin showing strong momentum! 24h change: +5.2%\n Support level: $48.5K\n Next resistance: $52K\n\nVolume up 25% - bulls in control! \n\n#Crypto #Trading",
        " Market Update:\n Total crypto market cap: $2.1T\n BTC dominance: 42%\n 24h volume: $98B\n\nBullish structure forming! \n\n#Crypto #Markets"
    ],
    MEMECOINS: [
        " $DOGE pumping on social sentiment!\n 24h gain: +15%\n Social mentions: +85%\n\nMeme season heating up! \n\n#Dogecoin #Crypto",
        " New memecoin alert!\n $PEPE gaining traction\n 7d volume: +300%\n\nNFA - Always DYOR! \n\n#Memecoins #Crypto"
    ],
    DEFI: [
        " DeFi TVL hits new ATH!\n $89B locked\n Top protocol: @AaveAave\n Best yield: 12% APY\n\nDeFi summer loading... \n\n#DeFi #Yield",
        " New DeFi protocol launch!\n @UniswapProtocol v4\n Initial TVL: $50M\n\nInnovation never stops! \n\n#DeFi #Uniswap"
    ],
    SENTIMENT: [
        " Crypto Fear & Greed Index: 75\n 'Greed' zone\n 30d change: +25\n\nMarket confidence rising! \n\n#Crypto #Trading",
        " Social Sentiment Analysis:\n BTC mentions: +45%\n Positive sentiment: 78%\n\nBulls taking control! \n\n#Bitcoin #Analysis"
    ],
    HYPE: [
        " TRENDING ALERT!\n $SOL pumping +25%\n Social engagement: 85K\n 24h volume surge: 312%\n\nMassive momentum building! \n\n#Solana #Crypto",
        " HYPE CHECK!\n New @arbitrum upgrade\n TVL +45% this week\n Community buzzing\n\nMajor catalyst incoming! \n\n#Arbitrum #L2"
    ],
    GEM_ALERT: [
        " GEM SPOTTED!\n @NewProtocol\n MC: $5M\n Backers: @VCFirm\n Unique tech: AI + DeFi\n\nEarly stages! \n\nNFA #Crypto #Gems",
        " Hidden Gem Alert!\n New DEX launching\n MC: $2M\n LP locked 2 years\n Audited by @Certik\n\nDYOR! \n\n#Crypto #Gems"
    ]
};

export default function TweetPreview({ selectedTypes, frequency, onApprove }: TweetPreviewProps) {
    const [pendingTweets, setPendingTweets] = useState<Tweet[]>([]);
    const [previewTweet, setPreviewTweet] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [metrics, setMetrics] = useState({ likes: 0, retweets: 0, replies: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for new tweets every minute
        const interval = setInterval(() => {
            setPendingTweets(tweetGenerator.getPendingTweets());
        }, 60000);

        // Initial load
        setPendingTweets(tweetGenerator.getPendingTweets());

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const generatePreviewTweet = async () => {
            if (selectedTypes.length === 0) {
                setPreviewTweet('');
                return;
            }

            setIsLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Randomly select a tweet type from selected types
                const randomType = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                const tweets = sampleTweets[randomType];
                const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
                
                setPreviewTweet(randomTweet);
                // Simulate random engagement metrics
                setMetrics({
                    likes: Math.floor(Math.random() * 50) + 10,
                    retweets: Math.floor(Math.random() * 20) + 5,
                    replies: Math.floor(Math.random() * 10) + 2
                });
            } catch (error) {
                const err = error as Error;
                console.error('Error generating preview:', err.message);
            } finally {
                setIsLoading(false);
            }
        };

        generatePreviewTweet();
    }, [selectedTypes]);

    const handlePostTweet = async () => {
        if (!previewTweet) return;
        
        setLoading(true);
        setError(null);
        setSuccess(false);
        
        try {
            const response = await fetch('/api/tweet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: previewTweet }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to post tweet');
            }
            
            setSuccess(true);
            // Generate a new preview tweet
            const randomType = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
            const tweets = sampleTweets[randomType];
            const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
            setPreviewTweet(randomTweet);
        } catch (err) {
            const error = err as TweetError;
            setError(error.message);
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConnectTwitter = () => {
        window.location.href = '/api/auth/twitter';
    };

    if (selectedTypes.length === 0) {
        return (
            <div className="card bg-base-200">
                <div className="card-body items-center text-center">
                    <Image 
                        src="/tweet-preview.png" 
                        alt="Tweet Preview" 
                        width={64} 
                        height={64} 
                        className="opacity-50"
                    />
                    <h3 className="text-lg font-medium mt-4">Select tweet types and adjust frequency</h3>
                    <p className="text-base-content/70">to generate a preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Pending Tweets</h2>
                <button
                    onClick={handleConnectTwitter}
                    className="btn btn-primary"
                >
                    Connect Twitter Account
                </button>
            </div>

            {pendingTweets.length === 0 ? (
                <div className="text-base-content/70">No pending tweets to approve</div>
            ) : (
                <div className="space-y-4">
                    {pendingTweets.map((tweet) => (
                        <div key={tweet.id} className="card bg-base-200">
                            <div className="card-body">
                                <p>{tweet.content}</p>
                                <div className="card-actions justify-end">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => onApprove?.(tweet.id)}
                                    >
                                        Approve & Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Tweet Preview</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">❤️ {metrics.likes}</span>
                                <span className="text-sm">🔄 {metrics.retweets}</span>
                                <span className="text-sm">💬 {metrics.replies}</span>
                            </div>
                            <button
                                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                onClick={handlePostTweet}
                                disabled={loading || !previewTweet}
                            >
                                {loading ? 'Posting...' : 'Post Tweet Now'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Tweet posted successfully!</span>
                        </div>
                    )}

                    <div className={`relative rounded-lg p-4 ${isLoading ? 'animate-pulse' : ''}`}>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-base-300 rounded w-3/4"></div>
                                <div className="h-4 bg-base-300 rounded w-1/2"></div>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">{previewTweet}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
