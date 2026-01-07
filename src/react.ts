/**
 * @bantis/local-cipher/react - React Integration
 * React hooks for encrypted browser storage
 * 
 * @version 2.1.0
 * @license MIT
 */

// Re-export everything from core
export * from './index';

// React-specific exports
export {
    initializeSecureStorage,
    useSecureStorage,
    useSecureStorageItem,
    useSecureStorageWithExpiry,
    useSecureStorageEvents,
    useNamespace,
    useSecureStorageDebug,
    secureStorage as reactSecureStorage,
} from './react/hooks';
