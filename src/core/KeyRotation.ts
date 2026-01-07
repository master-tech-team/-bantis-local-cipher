import { EncryptionHelper } from './EncryptionHelper';
import type { EncryptedBackup } from '../types';
import { Logger } from '../utils/logger';

/**
 * Key rotation utilities
 */
export class KeyRotation {
    private encryptionHelper: EncryptionHelper;
    private logger: Logger;

    constructor(encryptionHelper: EncryptionHelper, logger?: Logger) {
        this.encryptionHelper = encryptionHelper;
        this.logger = logger ?? new Logger();
    }

    /**
     * Rotate all encryption keys
     * Re-encrypts all data with a new salt
     */
    async rotateKeys(): Promise<void> {
        this.logger.info('Starting key rotation...');

        // 1. Export all current data
        const backup = await this.exportEncryptedData();

        // 2. Clear old encryption
        this.encryptionHelper.clearEncryptedData();

        // 3. Initialize new encryption
        await this.encryptionHelper.initialize();

        // 4. Re-encrypt all data
        for (const [key, value] of Object.entries(backup.data)) {
            const encryptedKey = await this.encryptionHelper.encryptKey(key);
            const encryptedValue = await this.encryptionHelper.encrypt(value);
            localStorage.setItem(encryptedKey, encryptedValue);
        }

        this.logger.info(`Key rotation completed. Re-encrypted ${backup.metadata.itemCount} items`);
    }

    /**
     * Export all encrypted data as backup
     */
    async exportEncryptedData(): Promise<EncryptedBackup> {
        this.logger.info('Exporting encrypted data...');
        const data: Record<string, string> = {};
        let itemCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const encryptedKey = localStorage.key(i);
            if (encryptedKey && encryptedKey.startsWith('__enc_')) {
                const encryptedValue = localStorage.getItem(encryptedKey);
                if (encryptedValue) {
                    try {
                        // Decrypt to get original key and value
                        const decryptedValue = await this.encryptionHelper.decrypt(encryptedValue);
                        // Store with encrypted key as identifier
                        data[encryptedKey] = decryptedValue;
                        itemCount++;
                    } catch (error) {
                        this.logger.warn(`Failed to decrypt key ${encryptedKey}:`, error);
                    }
                }
            }
        }

        const backup: EncryptedBackup = {
            version: '2.0.0',
            timestamp: Date.now(),
            data,
            metadata: {
                keyVersion: this.encryptionHelper.getKeyVersion(),
                algorithm: 'AES-256-GCM',
                itemCount,
            },
        };

        this.logger.info(`Exported ${itemCount} items`);
        return backup;
    }

    /**
     * Import encrypted data from backup
     */
    async importEncryptedData(backup: EncryptedBackup): Promise<void> {
        this.logger.info(`Importing backup from ${new Date(backup.timestamp).toISOString()}...`);

        let imported = 0;
        for (const [encryptedKey, value] of Object.entries(backup.data)) {
            try {
                const encryptedValue = await this.encryptionHelper.encrypt(value);
                localStorage.setItem(encryptedKey, encryptedValue);
                imported++;
            } catch (error) {
                this.logger.error(`Failed to import key ${encryptedKey}:`, error);
            }
        }

        this.logger.info(`Imported ${imported}/${backup.metadata.itemCount} items`);
    }
}
