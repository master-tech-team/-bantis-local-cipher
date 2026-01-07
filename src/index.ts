/**
 * @bantis/local-cipher - Core Module
 * Framework-agnostic client-side encryption for browser storage
 * 
 * @version 2.1.0
 * @license MIT
 */

// Core classes
export { EncryptionHelper } from './core/EncryptionHelper';
export { SecureStorage } from './core/SecureStorage';
export { EventEmitter } from './core/EventEmitter';
export { KeyRotation } from './core/KeyRotation';
export { NamespacedStorage } from './core/NamespacedStorage';

// Type exports
export type {
    EncryptionConfig,
    StorageConfig,
    DebugConfig,
    SecureStorageConfig,
    StoredValue,
    ExpiryOptions,
    EncryptedBackup,
    IntegrityInfo,
    StorageEventType,
    StorageEventData,
    EventListener,
    LogLevel,
} from './types';
export { DEFAULT_CONFIG, LIBRARY_VERSION, STORAGE_VERSION } from './types';

// Utility exports
export { Logger } from './utils/logger';
export { compress, decompress, shouldCompress, isCompressionSupported } from './utils/compression';
export { debugEncryptionState, forceMigration } from './utils/debug';

// Default instance for vanilla JS
import { SecureStorage } from './core/SecureStorage';
export const secureStorage = SecureStorage.getInstance();

// Version
export const VERSION = '2.1.0';
