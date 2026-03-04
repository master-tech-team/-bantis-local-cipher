
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

    private async getIndex(): Promise<string[]> {
        const indexValue = await this.storage.getItem(`${this.prefix}__index__`);
        return indexValue ? JSON.parse(indexValue) : [];
    }

    private async saveToIndex(key: string): Promise<void> {
        const index = await this.getIndex();
        if (!index.includes(key)) {
            index.push(key);
            await this.storage.setItem(`${this.prefix}__index__`, JSON.stringify(index));
        }
    }

    private async removeFromIndex(key: string): Promise<void> {
        const index = await this.getIndex();
        const newIndex = index.filter(k => k !== key);
        if (newIndex.length !== index.length) {
            await this.storage.setItem(`${this.prefix}__index__`, JSON.stringify(newIndex));
        }
    }

    /**
     * Set item in this namespace
     */
    async setItem(key: string, value: string): Promise<void> {
        await this.storage.setItem(`${this.prefix}${key}`, value);
        await this.saveToIndex(key);
    }

    /**
     * Set item with expiry in this namespace
     */
    async setItemWithExpiry(key: string, value: string, options: { expiresIn?: number; expiresAt?: Date }): Promise<void> {
        await this.storage.setItemWithExpiry(`${this.prefix}${key}`, value, options);
        await this.saveToIndex(key);
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
        await this.storage.removeItem(`${this.prefix}${key}`);
        await this.removeFromIndex(key);
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
        const keysToRemove = await this.getIndex();
        for (const key of keysToRemove) {
            await this.storage.removeItem(`${this.prefix}${key}`);
        }
        await this.storage.removeItem(`${this.prefix}__index__`);
    }

    /**
     * Get all keys in this namespace
     */
    async keys(): Promise<string[]> {
        return this.getIndex();
    }
}
