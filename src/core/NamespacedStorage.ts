import type { SecureStorageConfig } from '../types';

/**
 * Namespaced storage for organizing data
 */
export class NamespacedStorage {
    private prefix: string;
    private storage: any; // Reference to parent SecureStorage

    constructor(storage: any, namespace: string) {
        this.storage = storage;
        this.prefix = `__ns_${namespace}__`;
    }

    /**
     * Set item in this namespace
     */
    async setItem(key: string, value: string): Promise<void> {
        return this.storage.setItem(`${this.prefix}${key}`, value);
    }

    /**
     * Set item with expiry in this namespace
     */
    async setItemWithExpiry(key: string, value: string, options: { expiresIn?: number; expiresAt?: Date }): Promise<void> {
        return this.storage.setItemWithExpiry(`${this.prefix}${key}`, value, options);
    }

    /**
     * Get item from this namespace
     */
    async getItem(key: string): Promise<string | null> {
        return this.storage.getItem(`${this.prefix}${key}`);
    }

    /**
     * Remove item from this namespace
     */
    async removeItem(key: string): Promise<void> {
        return this.storage.removeItem(`${this.prefix}${key}`);
    }

    /**
     * Check if item exists in this namespace
     */
    async hasItem(key: string): Promise<boolean> {
        return this.storage.hasItem(`${this.prefix}${key}`);
    }

    /**
     * Clear all items in this namespace
     */
    async clearNamespace(): Promise<void> {
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(this.prefix)) {
                keysToRemove.push(key.replace(this.prefix, ''));
            }
        }

        for (const key of keysToRemove) {
            await this.removeItem(key);
        }
    }

    /**
     * Get all keys in this namespace
     */
    async keys(): Promise<string[]> {
        const keys: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }

        return keys;
    }
}
