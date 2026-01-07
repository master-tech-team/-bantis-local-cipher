/**
 * @mtt/local-cipher
 * Librería de cifrado local AES-256-GCM para Angular, React y JavaScript
 * 
 * @author MTT
 * @license MIT
 */

// Core exports
export { EncryptionHelper } from './core/EncryptionHelper';
export { SecureStorage } from './core/SecureStorage';

// React exports
export {
    useSecureStorage,
    useSecureStorageItem,
    useSecureStorageDebug,
    secureStorage as reactSecureStorage,
} from './integrations/react';

// Angular exports
export { SecureStorageService } from './integrations/angular';

// Utility functions
export { debugEncryptionState, forceMigration } from './utils/debug';

// Default instance for vanilla JS
import { SecureStorage } from './core/SecureStorage';
export const secureStorage = SecureStorage.getInstance();

// Version
export const VERSION = '1.0.0';
