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
    }, [selectedTypes, frequency]);

    const handleApprove = (tweetId: string) => {
        const approvedTweet = tweetGenerator.approveTweet(tweetId);
        if (approvedTweet) {
            setPendingTweets(prev => prev.filter(t => t.id !== tweetId));
            onApprove?.(tweetId);
        }
    };

    const getTimeRemaining = (timestamp: number) => {
        const timeLeft = timestamp + 30 * 60 * 1000 - Date.now();
        const minutes = Math.floor(timeLeft / 60000);
        return minutes > 0 ? `${minutes} minutes` : 'Expiring soon';
    };

    const formatPrice = (price: number) => {
        if (price < 0.01) return price.toExponential(2);
        return price.toFixed(price < 1 ? 4 : 2);
    };

    const handleAuth = () => {
        window.location.href = '/api/auth/twitter';
    };

    const handleTweet = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await tweetBot.manualTweet();
            setSuccess(true);
        } catch (error) {
            const err = error as TweetError;
            setError(err.message || 'Failed to post tweet');
            console.error('Tweet error:', err);

            if (err.response?.status === 401) {
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Pending Tweets</h2>
                <div>
                    {!isAuthenticated ? (
                        <button
                            onClick={handleAuth}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Connect Twitter Account
                        </button>
                    ) : (
                        <button
                            onClick={handleTweet}
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-white ${
                                loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {loading ? 'Posting...' : 'Post Tweet'}
                        </button>
                    )}
                </div>
                {error && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                        Tweet posted successfully!
                    </div>
                )}
            </div>

            {pendingTweets.length === 0 ? (
                <div className="text-center py-8 text-base-content/70">
                    No pending tweets to approve
                </div>
            ) : (
                pendingTweets.map(tweet => (
                    <div
                        key={tweet.id}
                        className="bg-base-200 rounded-lg p-4 space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <p className="font-medium break-words">{tweet.content}</p>
                                <div className="flex items-center gap-2 text-sm text-base-content/70">
                                    <span>Expires in: {getTimeRemaining(tweet.timestamp)}</span>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary btn-sm ml-4"
                                onClick={() => handleApprove(tweet.id)}
                            >
                                Approve
                            </button>
                        </div>

                        <div className="divider my-2">Market Insights</div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Top Coins</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {tweet.metrics.topCoins.map((coin: CoinData) => (
                                        <div key={coin.symbol} className="bg-base-300 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Image 
                                                    src={coin.logo} 
                                                    alt={coin.name} 
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                                <span className="font-medium">{coin.name}</span>
                                                <span className="text-sm text-base-content/70">${coin.symbol}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <div className="text-base-content/70">Price</div>
                                                    <div>${formatPrice(coin.price)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-base-content/70">24h Change</div>
                                                    <div className={coin.percent_change_24h > 0 ? 'text-success' : 'text-error'}>
                                                        {coin.percent_change_24h.toFixed(2)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-base-content/70">Sentiment</div>
                                                    <div>{coin.sentiment}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-base-content/70">Galaxy Score</div>
                                                    <div>{coin.galaxy_score}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Trending Pools</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {tweet.metrics.trendingPools.map((pool: Pool) => (
                                        <div key={pool.id} className="bg-base-300 rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{pool.attributes.name}</span>
                                                <span className="text-sm text-base-content/70">
                                                    {pool.relationships.dex.data.id.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <div className="text-base-content/70">24h Volume</div>
                                                    <div>${(parseFloat(pool.attributes.volume_usd.h24) / 1e6).toFixed(2)}M</div>
                                                </div>
                                                <div>
                                                    <div className="text-base-content/70">24h Change</div>
                                                    <div className={parseFloat(pool.attributes.price_change_percentage.h24) > 0 ? 'text-success' : 'text-error'}>
                                                        {parseFloat(pool.attributes.price_change_percentage.h24).toFixed(2)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-base-content/70">Liquidity</div>
                                                    <div>${(parseFloat(pool.attributes.reserve_in_usd) / 1e6).toFixed(2)}M</div>
                                                </div>
                                                <div>
                                                    <div className="text-base-content/70">Buy/Sell Ratio</div>
                                                    <div>
                                                        {(pool.attributes.transactions.h1.buys / 
                                                          (pool.attributes.transactions.h1.sells || 1)).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-base-content/70 mt-2">
                                                <div className="flex items-center gap-4">
                                                    <span>Buyers: {pool.attributes.transactions.h1.buyers}</span>
                                                    <span>Sellers: {pool.attributes.transactions.h1.sellers}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ... */}
                    </div>
                ))
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-base-300/30 backdrop-blur-sm rounded-xl animate-pulse">
                    <div className="loading loading-dots loading-lg text-primary"></div>
                    <p className="mt-4 text-base-content/70">Generating preview...</p>
                </div>
            ) : previewTweet ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Tweet Card */}
                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary rounded-full"></div>
                        <div className="bg-base-300/30 backdrop-blur-sm rounded-xl p-6">
                            {/* Tweet Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="avatar">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                        <span className="text-xl">🤖</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold truncate">CipherX Bot</h3>
                                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.52 3.59a.75.75 0 0 1 1.06 0l2.83 2.83L15.24 3.6a.75.75 0 0 1 1.06 0l4.1 4.1a.75.75 0 0 1 0 1.06l-2.83 2.83 2.83 2.83a.75.75 0 0 1 0 1.06l-4.1 4.1a.75.75 0 0 1-1.06 0l-2.83-2.83-2.83 2.83a.75.75 0 0 1-1.06 0l-4.1-4.1a.75.75 0 0 1 0-1.06l2.83-2.83L4.42 8.75a.75.75 0 0 1 0-1.06l4.1-4.1Z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-base-content/70">@cipherx_bot</p>
                                </div>
                                <div className="text-base-content/50">
                                    <span className="text-xs">Just now</span>
                                </div>
                            </div>

                            {/* Tweet Content */}
                            <div className="space-y-3">
                                <p className="text-lg whitespace-pre-wrap leading-relaxed">{previewTweet}</p>
                            </div>

                            {/* Tweet Metrics */}
                            <div className="flex items-center gap-6 mt-4 text-base-content/70">
                                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                    </svg>
                                    <span className="text-sm">{metrics.replies}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                                    </svg>
                                    <span className="text-sm">{metrics.retweets}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    <span className="text-sm">{metrics.likes}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Info */}
                    <div className="bg-base-300/30 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Post Schedule</span>
                            <span className="badge badge-primary gap-2">
                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                {frequency}x daily
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-base-content/70">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Next post in ~{Math.floor(24 / frequency)} hours</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-base-300/30 backdrop-blur-sm rounded-xl text-base-content/70">
                    <div className="w-16 h-16 rounded-xl bg-base-200 flex items-center justify-center mb-4">
                        <span className="text-3xl">📝</span>
                    </div>
                    <p className="text-center">
                        Select tweet types and adjust frequency<br />to generate a preview
                    </p>
                </div>
            )}
        </div>
    );
}
