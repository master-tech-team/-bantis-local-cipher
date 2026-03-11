import { SecureCookie } from '../core/SecureCookie';

// Mock Web Crypto API since jsdom doesn't fully support it
const mockEncrypt = jest.fn();
const mockDecrypt = jest.fn();
const mockDigest = jest.fn();

beforeAll(() => {
    Object.defineProperty(global, 'crypto', {
        value: {
            subtle: {
                encrypt: mockEncrypt,
                decrypt: mockDecrypt,
                digest: mockDigest,
                importKey: jest.fn().mockResolvedValue({}),
                deriveKey: jest.fn().mockResolvedValue({}),
            },
            getRandomValues: jest.fn((arr) => {
                for (let i = 0; i < arr.length; i++) {
                    arr[i] = Math.floor(Math.random() * 256);
                }
                return arr;
            }),
        },
    });

    let cookieStore: string[] = [];
    Object.defineProperty(document, 'cookie', {
        configurable: true,
        get() {
            return cookieStore.join('; ');
        },
        set(val: string) {
            cookieStore = [val]; // Simpler mock representing just the newly set value for spying
        },
    });
});

describe('SecureCookie', () => {
    let secureCookie: SecureCookie;

    beforeEach(() => {
        secureCookie = SecureCookie.getInstance({
            encryption: { appIdentifier: 'test-cookie' },
            compression: false
        });
        
        mockDigest.mockResolvedValue(new Uint8Array(32).buffer);
        mockEncrypt.mockResolvedValue(new Uint8Array([1, 2, 3]).buffer);
        mockDecrypt.mockResolvedValue(new TextEncoder().encode('decrypted_value').buffer);

        // Reset document cookie
        document.cookie = '';
    });

    afterEach(() => {
        secureCookie.destroy();
        jest.clearAllMocks();
    });

    describe('set()', () => {
        it('should encrypt and set a cookie', async () => {
            const setSpy = jest.spyOn(document, 'cookie', 'set');
            await secureCookie.set('my_cookie', 'secret_data');
            
            // Should contain encoded encrypted key and value + default path=/
            expect(setSpy).toHaveBeenCalled();
            expect(mockEncrypt).toHaveBeenCalled();
        });

        it('should append cookie options correctly', async () => {
            const setSpy = jest.spyOn(document, 'cookie', 'set');
            const expiresDate = new Date();
            
            await secureCookie.set('testopt', 'val', {
                domain: '.test.com',
                path: '/secure',
                secure: true,
                sameSite: 'strict',
                expires: expiresDate
            });

            const lastSetString = setSpy.mock.calls[setSpy.mock.calls.length - 1][0];
            expect(lastSetString).toContain('domain=.test.com');
            expect(lastSetString).toContain('path=/secure');
            expect(lastSetString).toContain('secure');
            expect(lastSetString).toContain('samesite=strict');
            expect(lastSetString).toContain(`expires=${expiresDate.toUTCString()}`);
        });
    });

    describe('get()', () => {
        it('should retrieve and decrypt a cookie', async () => {
            await secureCookie.set('my_cookie', 'secret_data');
            const value = await secureCookie.get('my_cookie');
            expect(mockDecrypt).toHaveBeenCalled();
            expect(value).toBe('decrypted_value');
        });

        it('should return null for non-existent cookie', async () => {
            const value = await secureCookie.get('missing');
            expect(value).toBeNull();
        });
    });

    describe('remove()', () => {
        it('should set cookie expiration to past to remove it', async () => {
            const setSpy = jest.spyOn(document, 'cookie', 'set');
            await secureCookie.remove('my_cookie', { domain: '.test.com', path: '/test' });
            
            const lastSetString = setSpy.mock.calls[setSpy.mock.calls.length - 1][0];
            expect(lastSetString).toContain('domain=.test.com');
            expect(lastSetString).toContain('path=/test');
            // Unix epoch 0
            expect(lastSetString).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT');
        });
    });
});
