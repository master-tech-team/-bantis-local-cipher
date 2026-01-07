/**
 * @bantis/local-cipher v2.0.0
 * Librería de cifrado local AES-256-GCM para Angular, React y JavaScript
 * 
 * @author MTT
 * @license MIT
 */

// Core exports
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

// React exports
export {
    useSecureStorage,
    useSecureStorageItem,
    useSecureStorageDebug,
    secureStorage as reactSecureStorage,
} from './integrations/react';

// Angular exports
export { SecureStorageService } from './integrations/angular';

// Default instance for vanilla JS
import { SecureStorage } from './core/SecureStorage';
export const secureStorage = SecureStorage.getInstance();

// Version
export const VERSION = '2.0.0';
