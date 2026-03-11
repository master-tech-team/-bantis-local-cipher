import { Injectable } from '@angular/core';
import { createEncryptedCookieManager, createEncryptedStorage, localStore, sessionStore, cookies } from '../managers';
import { SecureStorage } from '../core/SecureStorage';
import { SecureCookie } from '../core/SecureCookie';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
    /** Acceso directo a localStorage sin cifrar */
    public local = localStore;
    /** Acceso directo a sessionStorage sin cifrar */
    public session = sessionStore;
    /** Acceso directo a cookies sin cifrar */
    public cookies = cookies;

    /**
     * Crea una instancia de almacenamiento sincronizado y cifrado
     * @param engine local o session storage
     * @param secretKey Llave de cifrado
     */
    public createEncryptedStorage(engine: 'localStorage' | 'sessionStorage', secretKey: string): SecureStorage {
        return createEncryptedStorage(engine, secretKey);
    }

    /**
     * Crea un gestor de cookies cifradas
     * @param secretKey Llave de cifrado
     * @param domain Configuración de subdominios
     */
    public createEncryptedCookieManager(secretKey: string, domain?: string): SecureCookie {
        return createEncryptedCookieManager(secretKey, domain);
    }
}
