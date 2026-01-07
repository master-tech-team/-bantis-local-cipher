import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SecureStorage } from '../core/SecureStorage';
import type { SecureStorageConfig, StorageEventData, ExpiryOptions, EncryptedBackup } from '../types';

/**
 * Servicio de Angular para SecureStorage v2
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
 * 
 * // Escuchar eventos
 * this.secureStorage.events$.subscribe(event => console.log(event));
 */
@Injectable({
    providedIn: 'root'
})
export class SecureStorageService {
    private storage: SecureStorage;
    private debugInfo$ = new BehaviorSubject(this.getDebugInfo());
    private eventsSubject$ = new Subject<StorageEventData>();

    /**
     * Observable de eventos de storage
     */
    public events$ = this.eventsSubject$.asObservable();

    constructor(config?: SecureStorageConfig) {
        this.storage = SecureStorage.getInstance(config);

        // Setup event forwarding to Observable
        this.storage.on('encrypted', (data) => this.eventsSubject$.next(data));
        this.storage.on('decrypted', (data) => this.eventsSubject$.next(data));
        this.storage.on('deleted', (data) => this.eventsSubject$.next(data));
        this.storage.on('cleared', (data) => this.eventsSubject$.next(data));
        this.storage.on('expired', (data) => this.eventsSubject$.next(data));
        this.storage.on('error', (data) => this.eventsSubject$.next(data));
        this.storage.on('keyRotated', (data) => this.eventsSubject$.next(data));
        this.storage.on('compressed', (data) => this.eventsSubject$.next(data));
        this.storage.on('decompressed', (data) => this.eventsSubject$.next(data));

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
     * Guarda un valor con expiración
     * @param key - Clave
     * @param value - Valor a guardar
     * @param options - Opciones de expiración
     * @returns Observable que completa cuando se guarda
     */
    setItemWithExpiry(key: string, value: string, options: ExpiryOptions): Observable<void> {
        return from(this.storage.setItemWithExpiry(key, value, options));
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
     * Limpia todos los items expirados
     * @returns Observable con el número de items eliminados
     */
    cleanExpired(): Observable<number> {
        return from(this.storage.cleanExpired());
    }

    /**
     * Verifica la integridad de un valor
     * @param key - Clave a verificar
     * @returns Observable con true si es válido
     */
    verifyIntegrity(key: string): Observable<boolean> {
        return from(this.storage.verifyIntegrity(key));
    }

    /**
     * Obtiene información de integridad de un valor
     * @param key - Clave
     * @returns Observable con información de integridad
     */
    getIntegrityInfo(key: string): Observable<any> {
        return from(this.storage.getIntegrityInfo(key));
    }

    /**
     * Crea un namespace para organizar datos
     * @param name - Nombre del namespace
     * @returns Instancia de NamespacedStorage
     */
    namespace(name: string) {
        return this.storage.namespace(name);
    }

    /**
     * Rota todas las claves de encriptación
     * @returns Observable que completa cuando termina la rotación
     */
    rotateKeys(): Observable<void> {
        return from(this.storage.rotateKeys());
    }

    /**
     * Exporta todos los datos como backup
     * @returns Observable con el backup
     */
    exportEncryptedData(): Observable<EncryptedBackup> {
        return from(this.storage.exportEncryptedData());
    }

    /**
     * Importa datos desde un backup
     * @param backup - Backup a importar
     * @returns Observable que completa cuando termina la importación
     */
    importEncryptedData(backup: EncryptedBackup): Observable<void> {
        return from(this.storage.importEncryptedData(backup));
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
    getDebugInfo$(): Observable<any> {
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
     * Helper para guardar objetos JSON con expiración
     * @param key - Clave
     * @param value - Objeto a guardar
     * @param options - Opciones de expiración
     */
    setObjectWithExpiry<T>(key: string, value: T, options: ExpiryOptions): Observable<void> {
        return this.setItemWithExpiry(key, JSON.stringify(value), options);
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

    /**
     * Registra un listener para un tipo de evento específico
     * @param event - Tipo de evento
     * @param handler - Función manejadora
     */
    on(event: any, handler: (data: StorageEventData) => void): void {
        this.storage.on(event, handler);
    }

    /**
     * Elimina un listener de evento
     * @param event - Tipo de evento
     * @param handler - Función manejadora
     */
    off(event: any, handler: (data: StorageEventData) => void): void {
        this.storage.off(event, handler);
    }

    /**
     * Observable filtrado por tipo de evento
     * @param eventType - Tipo de evento a filtrar
     * @returns Observable con eventos del tipo especificado
     */
    onEvent$(eventType: string): Observable<StorageEventData> {
        return this.events$.pipe(
            map(event => event.type === eventType ? event : null),
            map(event => event!)
        );
    }
}
