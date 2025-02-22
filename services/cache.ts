interface CacheItem<T> {
    data: T;
    timestamp: number;
}

export class CacheService {
    private cache: Map<string, CacheItem<any>>;

    constructor() {
        this.cache = new Map();
    }

    set<T>(key: string, data: T, ttlMinutes: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + ttlMinutes * 60 * 1000
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        if (Date.now() > item.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    clear(): void {
        this.cache.clear();
    }
}

// Export a singleton instance
export const cacheService = new CacheService();
