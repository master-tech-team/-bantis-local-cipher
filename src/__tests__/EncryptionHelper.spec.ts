import { EncryptionHelper } from '../core/EncryptionHelper';

describe('EncryptionHelper v2', () => {
    let helper: EncryptionHelper;

    beforeEach(() => {
        localStorage.clear();
        helper = new EncryptionHelper();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Configuration', () => {
        it('should use default configuration', () => {
            const defaultHelper = new EncryptionHelper();
            expect(defaultHelper.getKeyVersion()).toBe(1);
        });

        it('should accept custom configuration', () => {
            const customHelper = new EncryptionHelper({
                iterations: 150000,
                saltLength: 32,
                ivLength: 16,
                keyLength: 256,
                appIdentifier: 'custom-app'
            });

            expect(customHelper).toBeDefined();
        });
    });

    describe('Encryption/Decryption', () => {
        it('should encrypt and decrypt data', async () => {
            const plaintext = 'Hello, World!';

            const encrypted = await helper.encrypt(plaintext);
            expect(encrypted).toBeTruthy();
            expect(encrypted).not.toBe(plaintext);

            const decrypted = await helper.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        it('should handle empty strings', async () => {
            const plaintext = '';
            const encrypted = await helper.encrypt(plaintext);
            const decrypted = await helper.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        it('should handle special characters', async () => {
            const plaintext = '¡Hola! 你好 🎉 @#$%^&*()';
            const encrypted = await helper.encrypt(plaintext);
            const decrypted = await helper.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        it('should handle large data', async () => {
            const plaintext = 'x'.repeat(10000);
            const encrypted = await helper.encrypt(plaintext);
            const decrypted = await helper.decrypt(encrypted);
            expect(decrypted).toBe(plaintext);
        });
    });

    describe('Key Management', () => {
        it('should encrypt key names', async () => {
            const keyName = 'my-key';
            const encryptedKey = await helper.encryptKey(keyName);

            expect(encryptedKey).toBeTruthy();
            expect(encryptedKey).toContain('__enc_');
            expect(encryptedKey).not.toContain(keyName);
        });

        it('should generate consistent encrypted keys', async () => {
            const keyName = 'my-key';
            const encrypted1 = await helper.encryptKey(keyName);
            const encrypted2 = await helper.encryptKey(keyName);

            expect(encrypted1).toBe(encrypted2);
        });

        it('should track key version', () => {
            const version = helper.getKeyVersion();
            expect(typeof version).toBe('number');
            expect(version).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Initialization', () => {
        it('should initialize with new salt', async () => {
            await helper.initialize();

            const salt = localStorage.getItem('__app_salt');
            expect(salt).toBeTruthy();
        });

        it('should initialize from stored salt', async () => {
            await helper.initialize();
            const salt1 = localStorage.getItem('__app_salt');

            const helper2 = new EncryptionHelper();
            await helper2.initializeFromStored();
            const salt2 = localStorage.getItem('__app_salt');

            expect(salt1).toBe(salt2);
        });
    });

    describe('Crypto Support', () => {
        it('should detect Web Crypto API support', () => {
            const isSupported = EncryptionHelper.isSupported();
            expect(typeof isSupported).toBe('boolean');
        });
    });
});
