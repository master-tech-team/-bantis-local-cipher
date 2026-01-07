import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SecureStorage } from '../core/SecureStorage';

/**
 * Servicio de Angular para SecureStorage
 * Proporciona una API reactiva usando RxJS Observables
 * 
 * @example
 * constructor(private secureStorage: SecureStorageService) {}
 * 
 * // Guardar
 * this.secureStorage.setItem('token', 'abc123').subscribe();
 * 
 * // Leer
 * this.secureStorage.getItem('token').subscribe(token => console.log(token));
 */
@Injectable({
    providedIn: 'root'
})
export class SecureStorageService {
    private storage: SecureStorage;
    private debugInfo$ = new BehaviorSubject(this.getDebugInfo());

    constructor() {
        this.storage = SecureStorage.getInstance();

        // Actualizar debug info cada segundo
        setInterval(() => {
            this.debugInfo$.next(this.getDebugInfo());
        }, 1000);
    }

    /**
     * Guarda un valor encriptado
     * @param key - Clave
     * @param value - Valor a guardar
     * @returns Observable que completa cuando se guarda
     */
    setItem(key: string, value: string): Observable<void> {
        return from(this.storage.setItem(key, value));
    }

    /**
     * Recupera un valor desencriptado
     * @param key - Clave
     * @returns Observable con el valor o null
     */
    getItem(key: string): Observable<string | null> {
        return from(this.storage.getItem(key));
    }

    /**
     * Elimina un valor
     * @param key - Clave a eliminar
     * @returns Observable que completa cuando se elimina
     */
    removeItem(key: string): Observable<void> {
        return from(this.storage.removeItem(key));
    }

    /**
     * Verifica si existe una clave
     * @param key - Clave a verificar
     * @returns Observable con true/false
     */
    hasItem(key: string): Observable<boolean> {
        return from(this.storage.hasItem(key));
    }

    /**
     * Limpia todos los datos encriptados
     */
    clear(): void {
        this.storage.clear();
    }

    /**
     * Migra datos existentes a formato encriptado
     * @param keys - Array de claves a migrar
     * @returns Observable que completa cuando termina la migración
     */
    migrateExistingData(keys: string[]): Observable<void> {
        return from(this.storage.migrateExistingData(keys));
    }

    /**
     * Obtiene información de debug como Observable
     * @returns Observable con información de debug que se actualiza automáticamente
     */
    getDebugInfo$(): Observable<{
        cryptoSupported: boolean;
        encryptedKeys: string[];
        unencryptedKeys: string[];
        totalKeys: number;
    }> {
        return this.debugInfo$.asObservable();
    }

    /**
     * Obtiene información de debug de forma síncrona
     */
    private getDebugInfo() {
        return this.storage.getDebugInfo();
    }

    /**
     * Helper para guardar objetos JSON
     * @param key - Clave
     * @param value - Objeto a guardar
     */
    setObject<T>(key: string, value: T): Observable<void> {
        return this.setItem(key, JSON.stringify(value));
    }

    /**
     * Helper para recuperar objetos JSON
     * @param key - Clave
     * @returns Observable con el objeto parseado o null
     */
    getObject<T>(key: string): Observable<T | null> {
        return this.getItem(key).pipe(
            map(value => value ? JSON.parse(value) as T : null),
            catchError(() => from([null]))
        );
    }
}
