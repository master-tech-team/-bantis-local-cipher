import { createPlainStorage, createEncryptedStorage } from './StorageManager';
import { createPlainCookieManager, createEncryptedCookieManager } from './CookieManager';

export { PlainStorage } from './PlainStorage';
export { PlainCookie } from './PlainCookie';
export { createPlainStorage, createEncryptedStorage, createPlainCookieManager, createEncryptedCookieManager };

/**
 * Instancia predeterminada de almacenamiento local (sin cifrar).
 */
export const localStore = createPlainStorage('localStorage');

/**
 * Instancia predeterminada de almacenamiento de sesión (sin cifrar).
 */
export const sessionStore = createPlainStorage('sessionStorage');

/**
 * Instancia predeterminada de gestor de cookies (sin cifrar).
 */
export const cookies = createPlainCookieManager();
