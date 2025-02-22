import { useState, useEffect } from 'react';

export default function TwitterAuth() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const connectTwitter = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/twitter');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to initiate Twitter auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if we have an active Twitter session
    const checkTwitterAuth = async () => {
      try {
        const response = await fetch('/api/auth/twitter/check');
        const data = await response.json();
        setIsConnected(data.isAuthenticated);
      } catch (error) {
        console.error('Failed to check Twitter auth status:', error);
        setIsConnected(false);
      }
    };

    checkTwitterAuth();
  }, []);

  return (
    <div className="card-body">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="card-title">Twitter Connection</h2>
          <p className="text-base-content/70 mt-1">
            {isConnected 
              ? 'Your Twitter account is connected'
              : 'Connect your Twitter account to start posting'}
          </p>
        </div>
        <button
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
          onClick={connectTwitter}
          disabled={isConnected || isLoading}
        >
          {isConnected ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Connected
            </>
          ) : (
            'Connect Twitter'
          )}
        </button>
      </div>
      {isConnected && (
        <div className="flex items-center gap-2 text-sm text-success">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Ready to post tweets
        </div>
      )}
    </div>
  );
}
