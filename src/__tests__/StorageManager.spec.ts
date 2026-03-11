import { localStore, sessionStore, cookies, createEncryptedStorage, createEncryptedCookieManager } from '../managers';
import { SecureStorage } from '../core/SecureStorage';
import { SecureCookie } from '../core/SecureCookie';

describe('Storage Managers', () => {
    describe('PlainStorage', () => {
        beforeEach(() => {
            localStore.clear();
            sessionStore.clear();
        });

        it('should store and retrieve plain string to localStorage', async () => {
            await localStore.set('testKey', 'testValue');
            const result = await localStore.get('testKey');
            expect(result).toBe('testValue');
        });

        it('should store and retrieve objects to localStorage', async () => {
            const data = { a: 1, b: 'test' };
            await localStore.set('objKey', data);
            const result = await localStore.get<{ a: number, b: string }>('objKey');
            expect(result).toEqual(data);
        });

        it('should correctly remove and clear', async () => {
            await localStore.set('k1', 'v1');
            await localStore.remove('k1');
            expect(await localStore.get('k1')).toBeNull();

            await sessionStore.set('sk1', 'v1');
            sessionStore.clear();
            expect(await sessionStore.get('sk1')).toBeNull();
        });
    });

    describe('Factory functions', () => {
        it('createEncryptedStorage should return SecureStorage with correct config', () => {
            const storage = createEncryptedStorage('sessionStorage', 'mySecret');
            expect(storage).toBeInstanceOf(SecureStorage);
            // Verify somehow config
            expect(storage['config'].encryption.appIdentifier).toBe('mySecret');
            expect(storage['config'].storage.storageEngine).toBe(window.sessionStorage);
        });

        it('createEncryptedCookieManager should return SecureCookie with correct config', () => {
            const cm = createEncryptedCookieManager('mySecret', '.test.com');
            expect(cm).toBeInstanceOf(SecureCookie);
            expect(cm['config'].encryption.appIdentifier).toBe('mySecret');
            expect(cm['config'].cookieOptions.domain).toBe('.test.com');
        });
    });

    describe('PlainCookie', () => {
        it('should correctly set and get plaintext cookies', async () => {
            await cookies.set('plainTest', 'value', { maxAge: 60 });
            const val = await cookies.get('plainTest');
            expect(val).toBe('value');
            
            await cookies.remove('plainTest');
            expect(await cookies.get('plainTest')).toBeNull();
        });
    });
});
