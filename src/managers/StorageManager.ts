import { SecureStorage } from '../core/SecureStorage';
import { PlainStorage } from './PlainStorage';
import type { SecureStorageConfig } from '../types';

/**
 * Crea una instancia de almacenamiento encriptado.
 * @param engine 'localStorage' o 'sessionStorage'
 * @param secretKey Llave secreta opcional para derivación de claves
 * @param config Configuración adicional opcional
 * @returns Instancia de SecureStorage
 */
export function createEncryptedStorage(
    engine: 'localStorage' | 'sessionStorage' = 'localStorage',
    secretKey?: string,
    config?: SecureStorageConfig
): SecureStorage {
    const defaultEngine = typeof window !== 'undefined'
        ? (engine === 'sessionStorage' ? window.sessionStorage : window.localStorage)
        : ({} as Storage);

    const mergedConfig: SecureStorageConfig = {
        ...config,
        encryption: {
            ...config?.encryption,
            ...(secretKey ? { appIdentifier: secretKey } : {})
        },
        storage: {
            ...config?.storage,
            storageEngine: defaultEngine
        }
    };

    return SecureStorage.getInstance(mergedConfig);
}

/**
 * Crea una instancia de almacenamiento plano (sin cifrar).
 * @param engine 'localStorage' o 'sessionStorage'
 * @returns Instancia de PlainStorage
 */
export function createPlainStorage(
    engine: 'localStorage' | 'sessionStorage' = 'localStorage'
): PlainStorage {
    const defaultEngine = typeof window !== 'undefined'
        ? (engine === 'sessionStorage' ? window.sessionStorage : window.localStorage)
        : ({} as Storage);

    return new PlainStorage(defaultEngine);
}
