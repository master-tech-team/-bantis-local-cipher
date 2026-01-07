/**
 * Configuration types for @bantis/local-cipher
 */

/**
 * Encryption configuration options
 */
export interface EncryptionConfig {
    /** Number of PBKDF2 iterations (default: 100000) */
    iterations?: number;
    /** Salt length in bytes (default: 16) */
    saltLength?: number;
    /** IV length in bytes (default: 12) */
    ivLength?: number;
    /** Custom app identifier for fingerprinting (default: 'bantis-local-cipher-v2') */
    appIdentifier?: string;
    /** AES key length in bits (default: 256) */
    keyLength?: 128 | 192 | 256;
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
    /** Enable data compression (default: true for values > 1KB) */
    compression?: boolean;
    /** Compression threshold in bytes (default: 1024) */
    compressionThreshold?: number;
    /** Enable automatic cleanup of expired items (default: true) */
    autoCleanup?: boolean;
    /** Auto cleanup interval in ms (default: 60000 - 1 minute) */
    cleanupInterval?: number;
}

/**
 * Debug configuration options
 */
export interface DebugConfig {
    /** Enable debug mode (default: false) */
    enabled?: boolean;
    /** Log level (default: 'info') */
    logLevel?: LogLevel;
    /** Custom log prefix (default: 'SecureStorage') */
    prefix?: string;
}

/**
 * Log levels
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'verbose';

/**
 * Complete configuration for SecureStorage
 */
export interface SecureStorageConfig {
    /** Encryption configuration */
    encryption?: EncryptionConfig;
    /** Storage configuration */
    storage?: StorageConfig;
    /** Debug configuration */
    debug?: DebugConfig;
}

/**
 * Stored value with metadata
 */
export interface StoredValue {
    /** Encrypted value */
    value: string;
    /** Expiration timestamp (ms since epoch) */
    expiresAt?: number;
    /** Creation timestamp (ms since epoch) */
    createdAt: number;
    /** Last modified timestamp (ms since epoch) */
    modifiedAt: number;
    /** Data version for migration */
    version: number;
    /** Whether value is compressed */
    compressed?: boolean;
    /** SHA-256 checksum for integrity */
    checksum?: string;
}

/**
 * Options for setItemWithExpiry
 */
export interface ExpiryOptions {
    /** Expiration time in milliseconds from now */
    expiresIn?: number;
    /** Absolute expiration date */
    expiresAt?: Date;
}

/**
 * Encrypted backup structure
 */
export interface EncryptedBackup {
    /** Backup version */
    version: string;
    /** Backup timestamp */
    timestamp: number;
    /** Encrypted data */
    data: Record<string, string>;
    /** Backup metadata */
    metadata: {
        /** Key version used for encryption */
        keyVersion: number;
        /** Encryption algorithm */
        algorithm: string;
        /** Number of items */
        itemCount: number;
    };
}

/**
 * Integrity information
 */
export interface IntegrityInfo {
    /** Whether data is valid */
    valid: boolean;
    /** Last modified timestamp */
    lastModified: number;
    /** SHA-256 checksum */
    checksum: string;
    /** Data version */
    version: number;
}

/**
 * Storage event types
 */
export type StorageEventType =
    | 'encrypted'
    | 'decrypted'
    | 'deleted'
    | 'cleared'
    | 'expired'
    | 'error'
    | 'keyRotated'
    | 'compressed'
    | 'decompressed';

/**
 * Storage event data
 */
export interface StorageEventData {
    /** Event type */
    type: StorageEventType;
    /** Key involved (if applicable) */
    key?: string;
    /** Event timestamp */
    timestamp: number;
    /** Additional metadata */
    metadata?: any;
    /** Error (if type is 'error') */
    error?: Error;
}

/**
 * Event listener function
 */
export type EventListener = (data: StorageEventData) => void;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<SecureStorageConfig> = {
    encryption: {
        iterations: 100000,
        saltLength: 16,
        ivLength: 12,
        appIdentifier: 'bantis-local-cipher-v2',
        keyLength: 256,
    },
    storage: {
        compression: true,
        compressionThreshold: 1024,
        autoCleanup: true,
        cleanupInterval: 60000,
    },
    debug: {
        enabled: false,
        logLevel: 'info',
        prefix: 'SecureStorage',
    },
};

/**
 * Current library version
 */
export const LIBRARY_VERSION = '2.0.0';

/**
 * Storage data version
 */
export const STORAGE_VERSION = 2;
