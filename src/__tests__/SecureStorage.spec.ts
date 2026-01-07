import { SecureStorage } from '../core/SecureStorage';
import { EncryptionHelper } from '../core/EncryptionHelper';

describe('SecureStorage v2', () => {
    let storage: SecureStorage;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        storage = SecureStorage.getInstance();
    });

    afterEach(() => {
        storage.destroy();
        localStorage.clear();
    });

    describe('Basic Operations', () => {
        it('should store and retrieve encrypted data', async () => {
            const key = 'test-key';
            const value = 'test-value';

            await storage.setItem(key, value);
            const retrieved = await storage.getItem(key);

            expect(retrieved).toBe(value);
        });

        it('should return null for non-existent keys', async () => {
            const retrieved = await storage.getItem('non-existent');
            expect(retrieved).toBeNull();
        });

        it('should remove items', async () => {
            const key = 'test-key';
            await storage.setItem(key, 'value');
            await storage.removeItem(key);

            const retrieved = await storage.getItem(key);
            expect(retrieved).toBeNull();
        });

        it('should check if item exists', async () => {
            const key = 'test-key';
            await storage.setItem(key, 'value');

            const exists = await storage.hasItem(key);
            expect(exists).toBe(true);

            const notExists = await storage.hasItem('non-existent');
            expect(notExists).toBe(false);
        });
    });

    describe('Expiration', () => {
        it('should store item with expiration', async () => {
            const key = 'expiring-key';
            const value = 'expiring-value';

            await storage.setItemWithExpiry(key, value, { expiresIn: 1000 });
            const retrieved = await storage.getItem(key);

            expect(retrieved).toBe(value);
        });

        it('should return null for expired items', async () => {
            const key = 'expiring-key';
            const value = 'expiring-value';

            await storage.setItemWithExpiry(key, value, { expiresIn: 100 });

            // Wait for expiration
            await new Promise(resolve => setTimeout(resolve, 150));

            const retrieved = await storage.getItem(key);
            expect(retrieved).toBeNull();
        });

        it('should clean expired items', async () => {
            await storage.setItemWithExpiry('key1', 'value1', { expiresIn: 50 });
            await storage.setItemWithExpiry('key2', 'value2', { expiresIn: 10000 });

            // Wait for first item to expire
            await new Promise(resolve => setTimeout(resolve, 100));

            const cleanedCount = await storage.cleanExpired();
            expect(cleanedCount).toBeGreaterThan(0);

            // key1 should be gone, key2 should still exist
            expect(await storage.hasItem('key1')).toBe(false);
            expect(await storage.hasItem('key2')).toBe(true);
        });
    });

    describe('Events', () => {
        it('should emit encrypted event', (done) => {
            const key = 'test-key';

            storage.on('encrypted', (data) => {
                expect(data.key).toBe(key);
                done();
            });

            storage.setItem(key, 'value');
        });

        it('should emit decrypted event', (done) => {
            const key = 'test-key';

            storage.setItem(key, 'value').then(() => {
                storage.on('decrypted', (data) => {
                    expect(data.key).toBe(key);
                    done();
                });

                storage.getItem(key);
            });
        });

        it('should emit deleted event', (done) => {
            const key = 'test-key';

            storage.setItem(key, 'value').then(() => {
                storage.on('deleted', (data) => {
                    expect(data.key).toBe(key);
                    done();
                });

                storage.removeItem(key);
            });
        });
    });

    describe('Integrity', () => {
        it('should verify integrity of stored data', async () => {
            const key = 'test-key';
            await storage.setItem(key, 'value');

            const isValid = await storage.verifyIntegrity(key);
            expect(isValid).toBe(true);
        });

        it('should get integrity info', async () => {
            const key = 'test-key';
            await storage.setItem(key, 'value');

            const info = await storage.getIntegrityInfo(key);
            expect(info).not.toBeNull();
            expect(info?.valid).toBe(true);
            expect(info?.checksum).toBeTruthy();
        });
    });

    describe('Namespaces', () => {
        it('should create isolated namespaces', async () => {
            const ns1 = storage.namespace('user');
            const ns2 = storage.namespace('session');

            await ns1.setItem('data', 'user-data');
            await ns2.setItem('data', 'session-data');

            const userData = await ns1.getItem('data');
            const sessionData = await ns2.getItem('data');

            expect(userData).toBe('user-data');
            expect(sessionData).toBe('session-data');
        });

        it('should clear namespace independently', async () => {
            const ns1 = storage.namespace('user');
            const ns2 = storage.namespace('session');

            await ns1.setItem('data', 'user-data');
            await ns2.setItem('data', 'session-data');

            await ns1.clearNamespace();

            expect(await ns1.hasItem('data')).toBe(false);
            expect(await ns2.hasItem('data')).toBe(true);
        });
    });

    describe('Configuration', () => {
        it('should accept custom configuration', () => {
            const customStorage = SecureStorage.getInstance({
                encryption: { iterations: 150000 },
                storage: { compression: false },
                debug: { enabled: true, logLevel: 'verbose' }
            });

            const debugInfo = customStorage.getDebugInfo();
            expect(debugInfo.config.encryption.iterations).toBe(150000);
            expect(debugInfo.config.storage.compression).toBe(false);
        });
    });

    describe('Crypto Support', () => {
        it('should detect crypto support', () => {
            const isSupported = EncryptionHelper.isSupported();
            expect(isSupported).toBe(true);
        });
    });
});
