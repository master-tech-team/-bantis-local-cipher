import { EncryptionHelper } from './EncryptionHelper';

/**
 * SecureStorage - API de alto nivel que imita localStorage con cifrado automático
 * Implementa el patrón Singleton
 */
export class SecureStorage {
    private static instance: SecureStorage | null = null;
    private encryptionHelper: EncryptionHelper;

    private constructor() {
        this.encryptionHelper = new EncryptionHelper();
    }

    /**
     * Obtiene la instancia singleton de SecureStorage
     */
    public static getInstance(): SecureStorage {
        if (!SecureStorage.instance) {
            SecureStorage.instance = new SecureStorage();
        }
        return SecureStorage.instance;
    }

    /**
     * Guarda un valor encriptado en localStorage
     * @param key - Clave para almacenar
     * @param value - Valor a encriptar y almacenar
     */
    public async setItem(key: string, value: string): Promise<void> {
        if (!EncryptionHelper.isSupported()) {
            console.warn('Web Crypto API no soportada, usando localStorage sin encriptar');
            localStorage.setItem(key, value);
            return;
        }

        try {
            // Encriptar el nombre de la clave
            const encryptedKey = await this.encryptionHelper.encryptKey(key);

            // Encriptar el valor
            const encryptedValue = await this.encryptionHelper.encrypt(value);

            // Guardar en localStorage
            localStorage.setItem(encryptedKey, encryptedValue);
        } catch (error) {
            console.error('Error al guardar dato encriptado, usando fallback:', error);
            localStorage.setItem(key, value);
        }
    }

    /**
     * Recupera y desencripta un valor de localStorage
     * @param key - Clave a buscar
     * @returns Valor desencriptado o null si no existe
     */
    public async getItem(key: string): Promise<string | null> {
        if (!EncryptionHelper.isSupported()) {
            return localStorage.getItem(key);
        }

        try {
            // Encriptar el nombre de la clave
            const encryptedKey = await this.encryptionHelper.encryptKey(key);

            // Buscar el valor encriptado
            let encryptedValue = localStorage.getItem(encryptedKey);

            // Retrocompatibilidad: si no existe con clave encriptada, buscar con clave normal
            if (!encryptedValue) {
                encryptedValue = localStorage.getItem(key);
                if (!encryptedValue) {
                    return null;
                }
                // Si encontramos un valor con clave normal, intentar desencriptarlo
                // (podría ser un valor ya encriptado pero con clave antigua)
            }

            // Desencriptar el valor
            return await this.encryptionHelper.decrypt(encryptedValue);
        } catch (error) {
            console.error('Error al recuperar dato encriptado:', error);
            // Fallback: intentar leer directamente
            return localStorage.getItem(key);
        }
    }

    /**
     * Elimina un valor de localStorage
     * @param key - Clave a eliminar
     */
    public async removeItem(key: string): Promise<void> {
        if (!EncryptionHelper.isSupported()) {
            localStorage.removeItem(key);
            return;
        }

        try {
            // Encriptar el nombre de la clave
            const encryptedKey = await this.encryptionHelper.encryptKey(key);

            // Eliminar ambas versiones (encriptada y normal) por seguridad
            localStorage.removeItem(encryptedKey);
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error al eliminar dato encriptado:', error);
            localStorage.removeItem(key);
        }
    }

    /**
     * Verifica si existe un valor para la clave dada
     * @param key - Clave a verificar
     * @returns true si existe, false si no
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
    }

    /**
     * Migra datos existentes no encriptados a formato encriptado
     * @param keys - Array de claves a migrar
     */
    public async migrateExistingData(keys: string[]): Promise<void> {
        if (!EncryptionHelper.isSupported()) {
            console.warn('Web Crypto API no soportada, no se puede migrar');
            return;
        }

        console.log(`🔄 Iniciando migración de ${keys.length} claves...`);

        for (const key of keys) {
            try {
                // Leer el valor no encriptado
                const value = localStorage.getItem(key);

                if (value === null) {
                    continue; // La clave no existe, saltar
                }

                // Verificar si ya está encriptado intentando desencriptarlo
                try {
                    await this.encryptionHelper.decrypt(value);
                    console.log(`✓ ${key} ya está encriptado, saltando`);
                    continue;
                } catch {
                    // No está encriptado, proceder con la migración
                }

                // Guardar usando setItem (que encriptará automáticamente)
                await this.setItem(key, value);

                // Eliminar la versión no encriptada
                localStorage.removeItem(key);

                console.log(`✓ ${key} migrado exitosamente`);
            } catch (error) {
                console.error(`✗ Error al migrar ${key}:`, error);
            }
        }

        console.log('✅ Migración completada');
    }

    /**
     * Obtiene información de debug sobre el estado del almacenamiento
     */
    public getDebugInfo(): {
        cryptoSupported: boolean;
        encryptedKeys: string[];
        unencryptedKeys: string[];
        totalKeys: number;
    } {
        const allKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) allKeys.push(key);
        }

        const encryptedKeys = allKeys.filter(key => key.startsWith('__enc_'));
        const unencryptedKeys = allKeys.filter(
            key => !key.startsWith('__enc_') && key !== '__app_salt'
        );

        return {
            cryptoSupported: EncryptionHelper.isSupported(),
            encryptedKeys,
            unencryptedKeys,
            totalKeys: allKeys.length,
        };
    }
}
