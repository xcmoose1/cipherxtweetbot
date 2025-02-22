interface CacheItem {
    data: any;
    timestamp: number;
}

export class CacheService {
    private cache: Map<string, CacheItem>;

    constructor() {
        this.cache = new Map();
    }

    set(key: string, data: any, ttlMinutes: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + ttlMinutes * 60 * 1000
        });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        if (Date.now() > item.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    clear(): void {
        this.cache.clear();
    }
}

// Export a singleton instance
export const cacheService = new CacheService();
