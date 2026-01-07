import { EncryptionHelper } from './EncryptionHelper';
import { EventEmitter } from './EventEmitter';
import { KeyRotation } from './KeyRotation';
import { NamespacedStorage } from './NamespacedStorage';
import { Logger } from '../utils/logger';
import { compress, decompress, shouldCompress } from '../utils/compression';
import type {
    SecureStorageConfig,
    StoredValue,
    ExpiryOptions,
    IntegrityInfo,
    StorageEventType,
    EventListener,
} from '../types';
import { DEFAULT_CONFIG, STORAGE_VERSION } from '../types';

/**
 * SecureStorage v2 - API de alto nivel que imita localStorage con cifrado automático
 * Incluye: configuración personalizable, eventos, compresión, expiración, namespaces, rotación de claves
 */
export class SecureStorage {
    private static instance: SecureStorage | null = null;
    private encryptionHelper: EncryptionHelper;
    private eventEmitter: EventEmitter;
    private keyRotation: KeyRotation;
    private logger: Logger;
    private config: Required<SecureStorageConfig>;
    private cleanupInterval: NodeJS.Timeout | null = null;

    private constructor(config?: SecureStorageConfig) {
        // Merge config with defaults
        this.config = {
            encryption: { ...DEFAULT_CONFIG.encryption, ...config?.encryption },
            storage: { ...DEFAULT_CONFIG.storage, ...config?.storage },
            debug: { ...DEFAULT_CONFIG.debug, ...config?.debug },
        } as Required<SecureStorageConfig>;

        // Initialize components
        this.logger = new Logger(this.config.debug);
        this.encryptionHelper = new EncryptionHelper(this.config.encryption);
        this.eventEmitter = new EventEmitter();
        this.keyRotation = new KeyRotation(this.encryptionHelper, this.logger);

        this.logger.info('SecureStorage v2 initialized', this.config);

        // Setup auto-cleanup if enabled
        if (this.config.storage.autoCleanup) {
            this.setupAutoCleanup();
        }
    }

    /**
     * Obtiene la instancia singleton de SecureStorage
     */
    public static getInstance(config?: SecureStorageConfig): SecureStorage {
        if (!SecureStorage.instance) {
            SecureStorage.instance = new SecureStorage(config);
        }
        return SecureStorage.instance;
    }

    /**
     * Setup automatic cleanup of expired items
     */
    private setupAutoCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(() => {
            this.cleanExpired().catch(err => {
                this.logger.error('Auto-cleanup failed:', err);
            });
        }, this.config.storage.cleanupInterval);

        this.logger.debug(`Auto-cleanup enabled with interval: ${this.config.storage.cleanupInterval}ms`);
    }

    /**
     * Guarda un valor encriptado en localStorage
     */
    public async setItem(key: string, value: string): Promise<void> {
        this.logger.time(`setItem:${key}`);

        if (!EncryptionHelper.isSupported()) {
            this.logger.warn('Web Crypto API no soportada, usando localStorage sin encriptar');
            localStorage.setItem(key, value);
            return;
        }

        try {
            // Check if compression should be applied
            const shouldCompressData = this.config.storage.compression &&
                shouldCompress(value, this.config.storage.compressionThreshold);

            let processedValue = value;
            let compressed = false;

            if (shouldCompressData) {
                this.logger.debug(`Compressing value for key: ${key}`);
                const compressedData = await compress(value);
                processedValue = this.encryptionHelper['arrayBufferToBase64'](compressedData.buffer);
                compressed = true;
                this.eventEmitter.emit('compressed', { key });
            }

            // Create StoredValue wrapper
            const now = Date.now();
            const storedValue: StoredValue = {
                value: processedValue,
                createdAt: now,
                modifiedAt: now,
                version: STORAGE_VERSION,
                compressed,
            };

            // Calculate checksum for integrity
            const checksum = await this.calculateChecksum(processedValue);
            storedValue.checksum = checksum;

            // Serialize StoredValue
            const serialized = JSON.stringify(storedValue);

            // Encrypt the key
            const encryptedKey = await this.encryptionHelper.encryptKey(key);

            // Encrypt the value
            const encryptedValue = await this.encryptionHelper.encrypt(serialized);

            // Store in localStorage
            localStorage.setItem(encryptedKey, encryptedValue);

            this.logger.verbose(`Stored key: ${key}, compressed: ${compressed}, size: ${encryptedValue.length}`);
            this.eventEmitter.emit('encrypted', { key, metadata: { compressed, size: encryptedValue.length } });
            this.logger.timeEnd(`setItem:${key}`);
        } catch (error) {
            this.logger.error(`Error al guardar dato encriptado para ${key}:`, error);
            this.eventEmitter.emit('error', { key, error: error as Error });
            localStorage.setItem(key, value);
        }
    }

    /**
     * Guarda un valor con tiempo de expiración
     */
    public async setItemWithExpiry(key: string, value: string, options: ExpiryOptions): Promise<void> {
        this.logger.time(`setItemWithExpiry:${key}`);

        if (!EncryptionHelper.isSupported()) {
            this.logger.warn('Web Crypto API no soportada, usando localStorage sin encriptar');
            localStorage.setItem(key, value);
            return;
        }

        try {
            // Check if compression should be applied
            const shouldCompressData = this.config.storage.compression &&
                shouldCompress(value, this.config.storage.compressionThreshold);

            let processedValue = value;
            let compressed = false;

            if (shouldCompressData) {
                this.logger.debug(`Compressing value for key: ${key}`);
                const compressedData = await compress(value);
                processedValue = this.encryptionHelper['arrayBufferToBase64'](compressedData.buffer);
                compressed = true;
                this.eventEmitter.emit('compressed', { key });
            }

            // Calculate expiration timestamp
            let expiresAt: number | undefined;
            if (options.expiresIn) {
                expiresAt = Date.now() + options.expiresIn;
            } else if (options.expiresAt) {
                expiresAt = options.expiresAt.getTime();
            }

            // Create StoredValue wrapper
            const now = Date.now();
            const storedValue: StoredValue = {
                value: processedValue,
                createdAt: now,
                modifiedAt: now,
                version: STORAGE_VERSION,
                compressed,
                expiresAt,
            };

            // Calculate checksum for integrity
            const checksum = await this.calculateChecksum(processedValue);
            storedValue.checksum = checksum;

            // Serialize StoredValue
            const serialized = JSON.stringify(storedValue);

            // Encrypt the key
            const encryptedKey = await this.encryptionHelper.encryptKey(key);

            // Encrypt the value
            const encryptedValue = await this.encryptionHelper.encrypt(serialized);

            // Store in localStorage
            localStorage.setItem(encryptedKey, encryptedValue);

            this.logger.verbose(`Stored key with expiry: ${key}, expiresAt: ${expiresAt}`);
            this.eventEmitter.emit('encrypted', { key, metadata: { compressed, expiresAt } });
            this.logger.timeEnd(`setItemWithExpiry:${key}`);
        } catch (error) {
            this.logger.error(`Error al guardar dato con expiración para ${key}:`, error);
            this.eventEmitter.emit('error', { key, error: error as Error });
            throw error;
        }
    }

    /**
     * Recupera y desencripta un valor de localStorage
     */
    public async getItem(key: string): Promise<string | null> {
        this.logger.time(`getItem:${key}`);

        if (!EncryptionHelper.isSupported()) {
            return localStorage.getItem(key);
        }

        try {
            // Encrypt the key
            const encryptedKey = await this.encryptionHelper.encryptKey(key);

            // Get encrypted value
            let encryptedValue = localStorage.getItem(encryptedKey);

            // Backward compatibility: try with plain key
            if (!encryptedValue) {
                encryptedValue = localStorage.getItem(key);
                if (!encryptedValue) {
                    this.logger.timeEnd(`getItem:${key}`);
                    return null;
                }
            }

            // Decrypt the value
            const decrypted = await this.encryptionHelper.decrypt(encryptedValue);

            // Try to parse as StoredValue (v2 format)
            let storedValue: StoredValue;
            try {
                storedValue = JSON.parse(decrypted);

                // Validate it's a StoredValue object
                if (!storedValue.value || !storedValue.version) {
                    // It's v1 format (plain string), auto-migrate
                    this.logger.info(`Auto-migrating v1 data for key: ${key}`);
                    await this.setItem(key, decrypted);
                    this.logger.timeEnd(`getItem:${key}`);
                    return decrypted;
                }
            } catch {
                // Not JSON, it's v1 format (plain string), auto-migrate
                this.logger.info(`Auto-migrating v1 data for key: ${key}`);
                await this.setItem(key, decrypted);
                this.logger.timeEnd(`getItem:${key}`);
                return decrypted;
            }

            // Check expiration
            if (storedValue.expiresAt && storedValue.expiresAt < Date.now()) {
                this.logger.info(`Key expired: ${key}`);
                await this.removeItem(key);
                this.eventEmitter.emit('expired', { key });
                this.logger.timeEnd(`getItem:${key}`);
                return null;
            }

            // Verify integrity if checksum exists
            if (storedValue.checksum) {
                const calculatedChecksum = await this.calculateChecksum(storedValue.value);
                if (calculatedChecksum !== storedValue.checksum) {
                    this.logger.warn(`Integrity check failed for key: ${key}`);
                    this.eventEmitter.emit('error', {
                        key,
                        error: new Error('Integrity verification failed')
                    });
                }
            }

            // Decompress if needed
            let finalValue = storedValue.value;
            if (storedValue.compressed) {
                this.logger.debug(`Decompressing value for key: ${key}`);
                const compressedData = this.encryptionHelper['base64ToArrayBuffer'](storedValue.value);
                finalValue = await decompress(new Uint8Array(compressedData));
                this.eventEmitter.emit('decompressed', { key });
            }

            this.eventEmitter.emit('decrypted', { key });
            this.logger.timeEnd(`getItem:${key}`);
            return finalValue;
        } catch (error) {
            this.logger.error(`Error al recuperar dato encriptado para ${key}:`, error);
            this.eventEmitter.emit('error', { key, error: error as Error });
            // Fallback: try plain key
            const fallback = localStorage.getItem(key);
            this.logger.timeEnd(`getItem:${key}`);
            return fallback;
        }
    }

    /**
     * Elimina un valor de localStorage
     */
    public async removeItem(key: string): Promise<void> {
        if (!EncryptionHelper.isSupported()) {
            localStorage.removeItem(key);
            return;
        }

        try {
            const encryptedKey = await this.encryptionHelper.encryptKey(key);
            localStorage.removeItem(encryptedKey);
            localStorage.removeItem(key); // Remove both versions
            this.eventEmitter.emit('deleted', { key });
            this.logger.info(`Removed key: ${key}`);
        } catch (error) {
            this.logger.error(`Error al eliminar dato para ${key}:`, error);
            localStorage.removeItem(key);
        }
    }

    /**
     * Verifica si existe un valor para la clave dada
     */
    public async hasItem(key: string): Promise<boolean> {
        const value = await this.getItem(key);
        return value !== null;
    }

    /**
     * Limpia todos los datos encriptados
     */
    public clear(): void {
        this.encryptionHelper.clearEncryptedData();
        this.eventEmitter.emit('cleared', {});
        this.logger.info('All encrypted data cleared');
    }

    /**
     * Limpia todos los items expirados
     */
    public async cleanExpired(): Promise<number> {
        this.logger.info('Starting cleanup of expired items...');
        let cleanedCount = 0;

        const keysToCheck: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('__enc_')) {
                keysToCheck.push(key);
            }
        }

        for (const encryptedKey of keysToCheck) {
            try {
                const encryptedValue = localStorage.getItem(encryptedKey);
                if (!encryptedValue) continue;

                const decrypted = await this.encryptionHelper.decrypt(encryptedValue);
                const storedValue: StoredValue = JSON.parse(decrypted);

                if (storedValue.expiresAt && storedValue.expiresAt < Date.now()) {
                    localStorage.removeItem(encryptedKey);
                    cleanedCount++;
                    this.eventEmitter.emit('expired', { key: encryptedKey });
                }
            } catch (error) {
                this.logger.warn(`Failed to check expiration for ${encryptedKey}:`, error);
            }
        }

        this.logger.info(`Cleanup completed. Removed ${cleanedCount} expired items`);
        return cleanedCount;
    }

    /**
     * Verifica la integridad de un valor almacenado
     */
    public async verifyIntegrity(key: string): Promise<boolean> {
        try {
            const encryptedKey = await this.encryptionHelper.encryptKey(key);
            const encryptedValue = localStorage.getItem(encryptedKey);

            if (!encryptedValue) return false;

            const decrypted = await this.encryptionHelper.decrypt(encryptedValue);
            const storedValue: StoredValue = JSON.parse(decrypted);

            if (!storedValue.checksum) {
                this.logger.warn(`No checksum found for key: ${key}`);
                return true; // No checksum to verify
            }

            const calculatedChecksum = await this.calculateChecksum(storedValue.value);
            return calculatedChecksum === storedValue.checksum;
        } catch (error) {
            this.logger.error(`Error verifying integrity for ${key}:`, error);
            return false;
        }
    }

    /**
     * Obtiene información de integridad de un valor
     */
    public async getIntegrityInfo(key: string): Promise<IntegrityInfo | null> {
        try {
            const encryptedKey = await this.encryptionHelper.encryptKey(key);
            const encryptedValue = localStorage.getItem(encryptedKey);

            if (!encryptedValue) return null;

            const decrypted = await this.encryptionHelper.decrypt(encryptedValue);
            const storedValue: StoredValue = JSON.parse(decrypted);

            const valid = storedValue.checksum
                ? await this.calculateChecksum(storedValue.value) === storedValue.checksum
                : true;

            return {
                valid,
                lastModified: storedValue.modifiedAt,
                checksum: storedValue.checksum || '',
                version: storedValue.version,
            };
        } catch (error) {
            this.logger.error(`Error getting integrity info for ${key}:`, error);
            return null;
        }
    }

    /**
     * Crea un namespace para organizar datos
     */
    public namespace(name: string): NamespacedStorage {
        this.logger.debug(`Creating namespace: ${name}`);
        return new NamespacedStorage(this, name);
    }

    /**
     * Rota todas las claves de encriptación
     */
    public async rotateKeys(): Promise<void> {
        this.logger.info('Starting key rotation...');
        await this.keyRotation.rotateKeys();
        this.eventEmitter.emit('keyRotated', {});
        this.logger.info('Key rotation completed');
    }

    /**
     * Exporta todos los datos encriptados como backup
     */
    public async exportEncryptedData() {
        return this.keyRotation.exportEncryptedData();
    }

    /**
     * Importa datos desde un backup
     */
    public async importEncryptedData(backup: any) {
        return this.keyRotation.importEncryptedData(backup);
    }

    /**
     * Registra un listener de eventos
     */
    public on(event: StorageEventType, listener: EventListener): void {
        this.eventEmitter.on(event, listener);
    }

    /**
     * Registra un listener de un solo uso
     */
    public once(event: StorageEventType, listener: EventListener): void {
        this.eventEmitter.once(event, listener);
    }

    /**
     * Elimina un listener de eventos
     */
    public off(event: StorageEventType, listener: EventListener): void {
        this.eventEmitter.off(event, listener);
    }

    /**
     * Elimina todos los listeners de un evento
     */
    public removeAllListeners(event?: StorageEventType): void {
        this.eventEmitter.removeAllListeners(event);
    }

    /**
     * Migra datos existentes no encriptados a formato encriptado
     */
    public async migrateExistingData(keys: string[]): Promise<void> {
        if (!EncryptionHelper.isSupported()) {
            this.logger.warn('Web Crypto API no soportada, no se puede migrar');
            return;
        }

        this.logger.info(`Iniciando migración de ${keys.length} claves...`);

        for (const key of keys) {
            try {
                const value = localStorage.getItem(key);
                if (value === null) continue;

                // Try to decrypt to check if already encrypted
                try {
                    await this.encryptionHelper.decrypt(value);
                    this.logger.info(`✓ ${key} ya está encriptado, saltando`);
                    continue;
                } catch {
                    // Not encrypted, proceed with migration
                }

                await this.setItem(key, value);
                localStorage.removeItem(key);
                this.logger.info(`✓ ${key} migrado exitosamente`);
            } catch (error) {
                this.logger.error(`✗ Error al migrar ${key}:`, error);
            }
        }

        this.logger.info('✅ Migración completada');
    }

    /**
     * Obtiene información de debug sobre el estado del almacenamiento
     */
    public getDebugInfo(): {
        cryptoSupported: boolean;
        encryptedKeys: string[];
        unencryptedKeys: string[];
        totalKeys: number;
        config: Required<SecureStorageConfig>;
    } {
        const allKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) allKeys.push(key);
        }

        const encryptedKeys = allKeys.filter(key => key.startsWith('__enc_'));
        const unencryptedKeys = allKeys.filter(
            key => !key.startsWith('__enc_') && key !== '__app_salt' && key !== '__key_version'
        );

        return {
            cryptoSupported: EncryptionHelper.isSupported(),
            encryptedKeys,
            unencryptedKeys,
            totalKeys: allKeys.length,
            config: this.config,
        };
    }

    /**
     * Calcula el checksum SHA-256 de un valor
     */
    private async calculateChecksum(value: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Cleanup on destroy
     */
    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.removeAllListeners();
        this.logger.info('SecureStorage destroyed');
    }
}
