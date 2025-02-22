import { useEffect, useState } from 'react';
import { cacheService } from '@/services/cache';

interface ApiStatus {
    name: string;
    isConnected: boolean;
}

export default function ApiStatus() {
    const [statuses, setStatuses] = useState<ApiStatus[]>([
        { name: 'LunarCrush', isConnected: false },
        { name: 'CoinGecko', isConnected: false }
    ]);

    const checkApiStatus = async () => {
        const lunarCrushData = await cacheService.get('lunarcrush_data');
        const coingeckoData = await cacheService.get('coingecko_pools');

        setStatuses([
            { name: 'LunarCrush', isConnected: !!lunarCrushData },
            { name: 'CoinGecko', isConnected: !!coingeckoData }
        ]);
    };

    useEffect(() => {
        checkApiStatus();
        // Check cache status every minute
        const interval = setInterval(checkApiStatus, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-4 bg-base-200 p-2 rounded-lg">
            {statuses.map((status) => (
                <div 
                    key={status.name}
                    className="flex items-center gap-2"
                    title={`${status.name} data ${status.isConnected ? 'available' : 'not available'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${
                        status.isConnected ? 'bg-success animate-pulse' : 'bg-error'
                    }`} />
                    <span className="text-sm font-medium">{status.name}</span>
                </div>
            ))}
        </div>
    );
}
