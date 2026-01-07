/**
 * EncryptionHelper - Clase responsable de todas las operaciones criptográficas
 * Implementa AES-256-GCM con derivación de claves PBKDF2 y fingerprinting del navegador
 */
export class EncryptionHelper {
    // Constantes criptográficas
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly KEY_LENGTH = 256;
    private static readonly IV_LENGTH = 12; // 96 bits para GCM
    private static readonly SALT_LENGTH = 16; // 128 bits
    private static readonly ITERATIONS = 100000;
    private static readonly HASH_ALGORITHM = 'SHA-256';
    private static readonly SALT_STORAGE_KEY = '__app_salt';
    private static readonly APP_IDENTIFIER = 'mtt-local-cipher-v1'; // Identificador único de la app

    // Propiedades privadas
    private key: CryptoKey | null = null;
    private baseKey: string = '';
    private baseKeyPromise: Promise<string> | null = null;

    /**
     * Genera un fingerprint único del navegador
     * Combina múltiples características del navegador para crear una huella digital
     */
    private async generateBaseKey(): Promise<string> {
        if (this.baseKeyPromise) {
            return this.baseKeyPromise;
        }

        this.baseKeyPromise = (async () => {
            const components = [
                navigator.userAgent,
                navigator.language,
                screen.width.toString(),
                screen.height.toString(),
                screen.colorDepth.toString(),
                new Intl.DateTimeFormat().resolvedOptions().timeZone,
                EncryptionHelper.APP_IDENTIFIER,
            ];

            const fingerprint = components.join('|');
            this.baseKey = await this.hashString(fingerprint);
            return this.baseKey;
        })();

        return this.baseKeyPromise;
    }

    /**
     * Hashea un string usando SHA-256
     * @param str - String a hashear
     * @returns Hash hexadecimal
     */
    private async hashString(str: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest(EncryptionHelper.HASH_ALGORITHM, data);
        return this.arrayBufferToHex(hashBuffer);
    }

    /**
     * Deriva una clave criptográfica usando PBKDF2
     * @param password - Password base (fingerprint)
     * @param salt - Salt aleatorio
     * @returns CryptoKey para AES-GCM
     */
    private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Importar el password como material de clave
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        // Derivar la clave AES-GCM
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt,
                iterations: EncryptionHelper.ITERATIONS,
                hash: EncryptionHelper.HASH_ALGORITHM,
            },
            keyMaterial,
            {
                name: EncryptionHelper.ALGORITHM,
                length: EncryptionHelper.KEY_LENGTH,
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Inicializa el sistema de encriptación generando un nuevo salt
     */
    public async initialize(): Promise<void> {
        // Generar salt aleatorio
        const salt = crypto.getRandomValues(new Uint8Array(EncryptionHelper.SALT_LENGTH));

        // Obtener y hashear el baseKey
        const baseKey = await this.generateBaseKey();

        // Derivar la clave
        this.key = await this.deriveKey(baseKey, salt);

        // Guardar el salt en localStorage
        localStorage.setItem(
            EncryptionHelper.SALT_STORAGE_KEY,
            this.arrayBufferToBase64(salt.buffer)
        );
    }

    /**
     * Inicializa desde un salt almacenado previamente
     */
    public async initializeFromStored(): Promise<void> {
        const storedSalt = localStorage.getItem(EncryptionHelper.SALT_STORAGE_KEY);

        if (!storedSalt) {
            // Si no hay salt almacenado, inicializar uno nuevo
            await this.initialize();
            return;
        }

        // Recuperar el salt
        const salt = new Uint8Array(this.base64ToArrayBuffer(storedSalt));

        // Obtener el baseKey
        const baseKey = await this.generateBaseKey();

        // Derivar la misma clave
        this.key = await this.deriveKey(baseKey, salt);
    }

    /**
     * Encripta un texto plano usando AES-256-GCM
     * @param plaintext - Texto a encriptar
     * @returns Texto encriptado en Base64 (IV + datos encriptados)
     */
    public async encrypt(plaintext: string): Promise<string> {
        if (!this.key) {
            await this.initializeFromStored();
        }

        if (!this.key) {
            throw new Error('No se pudo inicializar la clave de encriptación');
        }

        // Convertir texto a bytes
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);

        // Generar IV aleatorio
        const iv = crypto.getRandomValues(new Uint8Array(EncryptionHelper.IV_LENGTH));

        // Encriptar
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: EncryptionHelper.ALGORITHM,
                iv,
            },
            this.key,
            data
        );

        // Combinar IV + datos encriptados
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        // Retornar en Base64
        return this.arrayBufferToBase64(combined.buffer);
    }

    /**
     * Desencripta un texto encriptado
     * @param ciphertext - Texto encriptado en Base64
     * @returns Texto plano
     */
    public async decrypt(ciphertext: string): Promise<string> {
        if (!this.key) {
            await this.initializeFromStored();
        }

        if (!this.key) {
            throw new Error('No se pudo inicializar la clave de encriptación');
        }

        try {
            // Decodificar de Base64
            const combined = new Uint8Array(this.base64ToArrayBuffer(ciphertext));

            // Extraer IV y datos encriptados
            const iv = combined.slice(0, EncryptionHelper.IV_LENGTH);
            const encryptedData = combined.slice(EncryptionHelper.IV_LENGTH);

            // Desencriptar
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: EncryptionHelper.ALGORITHM,
                    iv,
                },
                this.key,
                encryptedData
            );

            // Convertir bytes a texto
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            throw new Error(`Error al desencriptar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Encripta el nombre de una clave para ofuscar nombres en localStorage
     * @param keyName - Nombre original de la clave
     * @returns Nombre encriptado con prefijo __enc_
     */
    public async encryptKey(keyName: string): Promise<string> {
        const baseKey = await this.generateBaseKey();
        const combined = keyName + baseKey;
        const hash = await this.hashString(combined);
        return `__enc_${hash.substring(0, 16)}`;
    }

    /**
     * Limpia todos los datos encriptados del localStorage
     */
    public clearEncryptedData(): void {
        const keysToRemove: string[] = [];

        // Identificar todas las claves encriptadas
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('__enc_')) {
                keysToRemove.push(key);
            }
        }

        // Eliminar claves encriptadas
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Eliminar salt
        localStorage.removeItem(EncryptionHelper.SALT_STORAGE_KEY);

        // Resetear clave en memoria
        this.key = null;
        this.baseKey = '';
        this.baseKeyPromise = null;
    }

    /**
     * Verifica si el navegador soporta Web Crypto API
     */
    public static isSupported(): boolean {
        return !!(
            typeof crypto !== 'undefined' &&
            crypto.subtle &&
            crypto.getRandomValues
        );
    }

    // Métodos auxiliares para conversión de datos

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    private arrayBufferToHex(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}
