import { Logger } from '../utils/logger';

/**
 * PlainStorage - Una interfaz consistente con SecureStorage pero sin cifrado.
 * Envuelve localStorage o sessionStorage con serialización JSON.
 */
export class PlainStorage {
    private storage: Storage;
    private logger: Logger;

    constructor(storageEngine: Storage = typeof window !== 'undefined' ? window.localStorage : ({} as Storage)) {
        this.storage = storageEngine;
        this.logger = new Logger({ prefix: 'PlainStorage' });
    }

    public async set<T>(key: string, value: T): Promise<void> {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            this.storage.setItem(key, serialized);
        } catch (error) {
            this.logger.error(`Error saving unencrypted item ${key}:`, error);
        }
    }

    public async get<T>(key: string): Promise<T | null> {
        try {
            const value = this.storage.getItem(key);
            if (value === null) return null;

            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T; // Fallback for plain strings
            }
        } catch (error) {
            this.logger.error(`Error reading unencrypted item ${key}:`, error);
            return null;
        }
    }

    public async remove(key: string): Promise<void> {
        this.storage.removeItem(key);
    }

    public clear(): void {
        this.storage.clear();
    }
}
