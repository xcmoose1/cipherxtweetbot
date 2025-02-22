import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TwitterAuth() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const connectTwitter = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/twitter');
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to initiate Twitter auth:', error);
      setError('Failed to connect to Twitter');
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

  useEffect(() => {
    // Handle auth errors from URL
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'auth_failed':
          setError('Twitter authentication failed');
          break;
        case 'invalid_callback':
          setError('Invalid authentication response');
          break;
        case 'access_token_failed':
          setError('Failed to get access token');
          break;
        case 'invalid_tokens':
          setError('Invalid tokens received');
          break;
        case 'api_not_configured':
          setError('Twitter API not properly configured');
          break;
        default:
          setError('An error occurred during authentication');
      }
    }

    // Clear error when success parameter is present
    if (searchParams.get('success') === 'true') {
      setError(null);
      setIsConnected(true);
    }
  }, [searchParams]);

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
      
      {error && (
        <div className="alert alert-error">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isConnected && !error && (
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
