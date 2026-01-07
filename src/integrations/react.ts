import { useState, useEffect, useCallback } from 'react';
import { SecureStorage } from '../core/SecureStorage';

const secureStorage = SecureStorage.getInstance();

/**
 * Hook de React para usar SecureStorage de forma reactiva
 * Similar a useState pero con persistencia encriptada
 * 
 * @param key - Clave para almacenar en localStorage
 * @param initialValue - Valor inicial si no existe en storage
 * @returns [value, setValue, loading, error]
 * 
 * @example
 * const [token, setToken, loading] = useSecureStorage('accessToken', '');
 */
export function useSecureStorage<T = string>(
    key: string,
    initialValue: T
): [T, (value: T) => Promise<void>, boolean, Error | null] {
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
        [key]
    );

    return [storedValue, setValue, loading, error];
}

/**
 * Hook para verificar si una clave existe en SecureStorage
 * 
 * @param key - Clave a verificar
 * @returns [exists, loading, error]
 * 
 * @example
 * const [hasToken, loading] = useSecureStorageItem('accessToken');
 */
export function useSecureStorageItem(
    key: string
): [boolean, boolean, Error | null] {
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
    }, [key]);

    return [exists, loading, error];
}

/**
 * Hook para obtener información de debug del almacenamiento
 * 
 * @returns Información de debug
 * 
 * @example
 * const debugInfo = useSecureStorageDebug();
 * console.log(`Claves encriptadas: ${debugInfo.encryptedKeys.length}`);
 */
export function useSecureStorageDebug() {
    const [debugInfo, setDebugInfo] = useState(secureStorage.getDebugInfo());

    useEffect(() => {
        // Actualizar cada segundo
        const interval = setInterval(() => {
            setDebugInfo(secureStorage.getDebugInfo());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return debugInfo;
}

/**
 * Exportar la instancia de SecureStorage para uso directo
 */
export { secureStorage };
