import { EncryptionHelper } from './EncryptionHelper';
import { compress, decompress, shouldCompress } from '../utils/compression';
import { Logger } from '../utils/logger';
import type { SecureCookieConfig, CookieOptions } from '../types';
import { DEFAULT_CONFIG } from '../types';

/**
 * SecureCookie - API de alto nivel para almacenamiento en cookies cifradas
 * Soporta opciones de cookies incluyendo domininios/subdominios y compresión.
 */
export class SecureCookie {
    private static instance: SecureCookie | null = null;
    private encryptionHelper: EncryptionHelper;
    private logger: Logger;
    private config: Required<SecureCookieConfig>;

    private constructor(config?: SecureCookieConfig) {
        this.config = {
            encryption: { ...DEFAULT_CONFIG.encryption, ...config?.encryption },
            cookieOptions: { path: '/', ...config?.cookieOptions },
            compression: config?.compression ?? true,
            debug: { ...DEFAULT_CONFIG.debug, ...config?.debug }
        } as Required<SecureCookieConfig>;

        this.logger = new Logger(this.config.debug);
        this.encryptionHelper = new EncryptionHelper(this.config.encryption);
        this.logger.info('SecureCookie initialized', this.config);
    }

    /**
     * Obtiene la instancia singleton de SecureCookie
     */
    public static getInstance(config?: SecureCookieConfig): SecureCookie {
        if (!SecureCookie.instance) {
            SecureCookie.instance = new SecureCookie(config);
        }
        return SecureCookie.instance;
    }

    /**
     * Serializa las opciones de cookie en un string
     */
    private serializeOptions(options: CookieOptions): string {
        let cookieString = '';

        if (options.expires) {
            cookieString += `; expires=${options.expires.toUTCString()}`;
        }
        if (options.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
        }
        if (options.domain) {
            cookieString += `; domain=${options.domain}`;
        }
        if (options.path) {
            cookieString += `; path=${options.path}`;
        }
        if (options.secure) {
            cookieString += `; secure`;
        }
        if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
        }

        return cookieString;
    }

    /**
     * Guarda un valor encriptado en una cookie
     */
    public async set(name: string, value: string, options?: CookieOptions): Promise<void> {
        this.logger.time(`cookie:set:${name}`);

        if (!EncryptionHelper.isSupported()) {
            this.logger.warn('Web Crypto API no soportada, guardando cookie sin cifrar');
            const mergedOptions = { ...this.config.cookieOptions, ...options };
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${this.serializeOptions(mergedOptions)}`;
            return;
        }

        try {
            // Check compression (aggressively compress cookies to save space since max is ~4KB)
            const shouldCompressData = this.config.compression && shouldCompress(value, 200);

            let processedValue = value;
            let metadataPrefix = 'P_'; // P_ = Plain

            if (shouldCompressData) {
                this.logger.debug(`Compressing cookie value for: ${name}`);
                const compressedData = await compress(value);
                processedValue = this.encryptionHelper['arrayBufferToBase64'](compressedData.buffer as ArrayBuffer);
                metadataPrefix = 'C_'; // C_ = Compressed
            }

            // Encrypt key name
            const encryptedKey = await this.encryptionHelper.encryptKey(name);

            // Serialize and Encrypt Value
            // Adding metadata prefix to avoid bloating value with massive StoredValue JSON headers
            const encryptedData = await this.encryptionHelper.encrypt(processedValue);
            const finalValue = metadataPrefix + encryptedData;

            // Prepare Cookie string
            const mergedOptions = { ...this.config.cookieOptions, ...options };
            const cookieOptionsStr = this.serializeOptions(mergedOptions);

            const cookieString = `${encodeURIComponent(encryptedKey)}=${encodeURIComponent(finalValue)}${cookieOptionsStr}`;
            
            // Verificación de tamaño de cookie
            if (cookieString.length > 4096) {
                this.logger.warn(`Cookie '${name}' es muy grande (${cookieString.length} bytes). Puede ser rechazada por el navegador.`);
            }

            document.cookie = cookieString;

            this.logger.verbose(`Stored cookie: ${name}`);
            this.logger.timeEnd(`cookie:set:${name}`);
        } catch (error) {
            this.logger.error(`Error al guardar cookie encriptada para ${name}:`, error);
            // Fallback sin cifrar como último recurso
            const mergedOptions = { ...this.config.cookieOptions, ...options };
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${this.serializeOptions(mergedOptions)}`;
        }
    }

    /**
     * Pide una cookie por nombre
     * Retorna el string o null si no existe
     */
    private getRawCookie(name: string): string | null {
        const nameEQ = encodeURIComponent(name) + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    /**
     * Recupera y desencripta un valor de cookie
     */
    public async get(name: string): Promise<string | null> {
        this.logger.time(`cookie:get:${name}`);

        if (!EncryptionHelper.isSupported()) {
            return this.getRawCookie(name);
        }

        try {
            // Find encrypted key
            const encryptedKey = await this.encryptionHelper.encryptKey(name);
            let rawValue = this.getRawCookie(encryptedKey);

            if (!rawValue) {
                // Backward compatibility just in case fallback was used
                rawValue = this.getRawCookie(name);
                if (!rawValue) {
                    this.logger.timeEnd(`cookie:get:${name}`);
                    return null;
                }
            }

            // Check if it has our metadata prefixes
            if (!rawValue.startsWith('P_') && !rawValue.startsWith('C_')) {
                // Podría ser un fallback plano
                this.logger.timeEnd(`cookie:get:${name}`);
                return rawValue; // Asumimos que es plano
            }

            const isCompressed = rawValue.startsWith('C_');
            const encryptedData = rawValue.substring(2);

            // Decrypt
            const decryptedString = await this.encryptionHelper.decrypt(encryptedData);

            // Decompress if needed
            let finalValue = decryptedString;
            if (isCompressed) {
                const compressedBuffer = this.encryptionHelper['base64ToArrayBuffer'](decryptedString);
                finalValue = await decompress(new Uint8Array(compressedBuffer));
            }

            this.logger.timeEnd(`cookie:get:${name}`);
            return finalValue;
        } catch (error) {
            this.logger.error(`Error al recuperar cookie encriptada para ${name}:`, error);
            // Fallback
            return this.getRawCookie(name);
        }
    }

    /**
     * Elimina una cookie
     */
    public async remove(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): Promise<void> {
        const mergedOptions = { ...this.config.cookieOptions, ...options };
        
        // Expirar la cookie configurándole una fecha del pasado
        const expireOptions: CookieOptions = {
            ...mergedOptions,
            expires: new Date(0),
            maxAge: 0
        };

        if (!EncryptionHelper.isSupported()) {
            document.cookie = `${encodeURIComponent(name)}=${this.serializeOptions(expireOptions)}`;
            return;
        }

        const encryptedKey = await this.encryptionHelper.encryptKey(name);
        
        // Remove encrypted cookie
        document.cookie = `${encodeURIComponent(encryptedKey)}=${this.serializeOptions(expireOptions)}`;
        
        // Also remove plain version just in case
        document.cookie = `${encodeURIComponent(name)}=${this.serializeOptions(expireOptions)}`;
    }

    /**
     * Limpia la instancia actual (útil para testing o refresco)
     */
    public destroy(): void {
        SecureCookie.instance = null;
    }
}
