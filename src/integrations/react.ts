import { useState, useEffect, useCallback } from 'react';
import { SecureStorage } from '../core/SecureStorage';
import type { SecureStorageConfig, StorageEventType, StorageEventData, ExpiryOptions } from '../types';

// Allow custom storage instance or use default
let defaultStorage: SecureStorage | null = null;

function getDefaultStorage(): SecureStorage {
    if (!defaultStorage) {
        defaultStorage = SecureStorage.getInstance();
    }
    return defaultStorage;
}

/**
 * Initialize SecureStorage with custom configuration
 */
export function initializeSecureStorage(config?: SecureStorageConfig): SecureStorage {
    defaultStorage = SecureStorage.getInstance(config);
    return defaultStorage;
}

/**
 * Hook de React para usar SecureStorage de forma reactiva
 * Similar a useState pero con persistencia encriptada
 * 
 * @param key - Clave para almacenar en localStorage
 * @param initialValue - Valor inicial si no existe en storage
 * @param storage - Instancia personalizada de SecureStorage (opcional)
 * @returns [value, setValue, loading, error]
 * 
 * @example
 * const [token, setToken, loading] = useSecureStorage('accessToken', '');
 */
export function useSecureStorage<T = string>(
    key: string,
    initialValue: T,
    storage?: SecureStorage
): [T, (value: T) => Promise<void>, boolean, Error | null] {
    const secureStorage = storage || getDefaultStorage();
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Cargar valor inicial
    useEffect(() => {
        const loadValue = async () => {
            try {
                setLoading(true);
                setError(null);
                const item = await secureStorage.getItem(key);

                if (item !== null) {
                    // Si T es un objeto, parsear JSON
                    if (typeof initialValue === 'object') {
                        setStoredValue(JSON.parse(item) as T);
                    } else {
                        setStoredValue(item as T);
                    }
                } else {
                    setStoredValue(initialValue);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error al cargar valor'));
                setStoredValue(initialValue);
            } finally {
                setLoading(false);
            }
        };

        loadValue();
    }, [key]); // Solo recargar si cambia la clave

    // Función para actualizar el valor
    const setValue = useCallback(
        async (value: T) => {
            try {
                setError(null);
                setStoredValue(value);

                // Si T es un objeto, convertir a JSON
                const valueToStore = typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value);

                await secureStorage.setItem(key, valueToStore);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error al guardar valor'));
                throw err;
            }
        },
        [key, secureStorage]
    );

    return [storedValue, setValue, loading, error];
}

/**
 * Hook para usar SecureStorage con expiración
 * 
 * @param key - Clave para almacenar
 * @param initialValue - Valor inicial
 * @param expiryOptions - Opciones de expiración
 * @param storage - Instancia personalizada de SecureStorage (opcional)
 * @returns [value, setValue, loading, error]
 * 
 * @example
 * const [session, setSession] = useSecureStorageWithExpiry('session', null, { expiresIn: 3600000 });
 */
export function useSecureStorageWithExpiry<T = string>(
    key: string,
    initialValue: T,
    expiryOptions: ExpiryOptions,
    storage?: SecureStorage
): [T, (value: T) => Promise<void>, boolean, Error | null] {
    const secureStorage = storage || getDefaultStorage();
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Cargar valor inicial
    useEffect(() => {
        const loadValue = async () => {
            try {
                setLoading(true);
                setError(null);
                const item = await secureStorage.getItem(key);

                if (item !== null) {
                    if (typeof initialValue === 'object') {
                        setStoredValue(JSON.parse(item) as T);
                    } else {
                        setStoredValue(item as T);
                    }
                } else {
                    setStoredValue(initialValue);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error al cargar valor'));
                setStoredValue(initialValue);
            } finally {
                setLoading(false);
            }
        };

        loadValue();
    }, [key]);

    // Función para actualizar el valor con expiración
    const setValue = useCallback(
        async (value: T) => {
            try {
                setError(null);
                setStoredValue(value);

                const valueToStore = typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value);

                await secureStorage.setItemWithExpiry(key, valueToStore, expiryOptions);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error al guardar valor'));
                throw err;
            }
        },
        [key, secureStorage, expiryOptions]
    );

    return [storedValue, setValue, loading, error];
}

/**
 * Hook para verificar si una clave existe en SecureStorage
 * 
 * @param key - Clave a verificar
 * @param storage - Instancia personalizada de SecureStorage (opcional)
 * @returns [exists, loading, error]
 * 
 * @example
 * const [hasToken, loading] = useSecureStorageItem('accessToken');
 */
export function useSecureStorageItem(
    key: string,
    storage?: SecureStorage
): [boolean, boolean, Error | null] {
    const secureStorage = storage || getDefaultStorage();
    const [exists, setExists] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const checkExists = async () => {
            try {
                setLoading(true);
                setError(null);
                const hasItem = await secureStorage.hasItem(key);
                setExists(hasItem);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error al verificar clave'));
                setExists(false);
            } finally {
                setLoading(false);
            }
        };

        checkExists();
    }, [key, secureStorage]);

    return [exists, loading, error];
}

/**
 * Hook para escuchar eventos de SecureStorage
 * 
 * @param event - Tipo de evento a escuchar
 * @param handler - Función manejadora del evento
 * @param storage - Instancia personalizada de SecureStorage (opcional)
 * 
 * @example
 * useSecureStorageEvents('encrypted', (data) => {
 *   console.log('Item encrypted:', data.key);
 * });
 */
export function useSecureStorageEvents(
    event: StorageEventType,
    handler: (data: StorageEventData) => void,
    storage?: SecureStorage
): void {
    const secureStorage = storage || getDefaultStorage();

    useEffect(() => {
        secureStorage.on(event, handler);

        return () => {
            secureStorage.off(event, handler);
        };
    }, [event, handler, secureStorage]);
}

/**
 * Hook para obtener información de debug del almacenamiento
 * 
 * @param storage - Instancia personalizada de SecureStorage (opcional)
 * @returns Información de debug
 * 
 * @example
 * const debugInfo = useSecureStorageDebug();
 * console.log(`Claves encriptadas: ${debugInfo.encryptedKeys.length}`);
 */
export function useSecureStorageDebug(storage?: SecureStorage) {
    const secureStorage = storage || getDefaultStorage();
    const [debugInfo, setDebugInfo] = useState(secureStorage.getDebugInfo());

    useEffect(() => {
        // Actualizar cada segundo
        const interval = setInterval(() => {
            setDebugInfo(secureStorage.getDebugInfo());
        }, 1000);

        return () => clearInterval(interval);
    }, [secureStorage]);

    return debugInfo;
}

/**
 * Hook para usar un namespace de SecureStorage
 * 
 * @param namespace - Nombre del namespace
 * @param storage - Instancia personalizada de SecureStorage (opcional)
 * @returns Instancia de NamespacedStorage
 * 
 * @example
 * const userStorage = useNamespace('user');
 * await userStorage.setItem('profile', JSON.stringify(profile));
 */
export function useNamespace(namespace: string, storage?: SecureStorage) {
    const secureStorage = storage || getDefaultStorage();
    const [namespacedStorage] = useState(() => secureStorage.namespace(namespace));

    return namespacedStorage;
}

/**
 * Exportar la instancia de SecureStorage para uso directo
 */
export const secureStorage = getDefaultStorage();
