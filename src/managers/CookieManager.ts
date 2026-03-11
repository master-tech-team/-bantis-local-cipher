import { SecureCookie } from '../core/SecureCookie';
import { PlainCookie } from './PlainCookie';
import type { SecureCookieConfig, CookieOptions } from '../types';

/**
 * Crea una instancia de manejador de cookies encriptadas.
 * @param secretKey Llave secreta opcional para derivación de claves
 * @param domain Dominio opcional (incluir punto inicial para subdominios ej. '.dominio.com')
 * @param config Configuración adicional opcional
 * @returns Instancia de SecureCookie
 */
export function createEncryptedCookieManager(
    secretKey?: string,
    domain?: string,
    config?: SecureCookieConfig
): SecureCookie {
    const mergedConfig: SecureCookieConfig = {
        ...config,
        encryption: {
            ...config?.encryption,
            ...(secretKey ? { appIdentifier: secretKey } : {})
        },
        cookieOptions: {
            ...config?.cookieOptions,
            ...(domain ? { domain } : {})
        }
    };

    return SecureCookie.getInstance(mergedConfig);
}

/**
 * Crea una instancia de manejador de cookies plano (sin cifrar).
 * @param defaultOptions Opciones por defecto para las cookies (ej. domain)
 * @returns Instancia de PlainCookie
 */
export function createPlainCookieManager(
    defaultOptions?: CookieOptions
): PlainCookie {
    return new PlainCookie(defaultOptions);
}
