import type { CookieOptions } from '../types';
import { Logger } from '../utils/logger';

/**
 * PlainCookie - Una interfaz consistente con SecureCookie pero sin cifrado.
 */
export class PlainCookie {
    private logger: Logger;
    private defaultOptions: CookieOptions;

    constructor(defaultOptions?: CookieOptions) {
        this.logger = new Logger({ prefix: 'PlainCookie' });
        this.defaultOptions = { path: '/', ...defaultOptions };
    }

    private serializeOptions(options: CookieOptions): string {
        let cookieString = '';
        if (options.expires) cookieString += `; expires=${options.expires.toUTCString()}`;
        if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
        if (options.domain) cookieString += `; domain=${options.domain}`;
        if (options.path) cookieString += `; path=${options.path}`;
        if (options.secure) cookieString += `; secure`;
        if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
        return cookieString;
    }

    public async set<T>(name: string, value: T, options?: CookieOptions): Promise<void> {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            const mergedOptions = { ...this.defaultOptions, ...options };
            document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(serialized)}${this.serializeOptions(mergedOptions)}`;
        } catch (error) {
            this.logger.error(`Error saving unencrypted cookie ${name}:`, error);
        }
    }

    public async get<T>(name: string): Promise<T | string | null> {
        try {
            const nameEQ = encodeURIComponent(name) + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    const decoded = decodeURIComponent(c.substring(nameEQ.length, c.length));
                    try {
                        return JSON.parse(decoded) as T;
                    } catch {
                        return decoded;
                    }
                }
            }
            return null;
        } catch (error) {
            this.logger.error(`Error reading unencrypted cookie ${name}:`, error);
            return null;
        }
    }

    public async remove(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): Promise<void> {
        const mergedOptions = { ...this.defaultOptions, ...options };
        document.cookie = `${encodeURIComponent(name)}=${this.serializeOptions({ ...mergedOptions, expires: new Date(0), maxAge: 0 })}`;
    }

    public clearAll(): void {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            this.remove(decodeURIComponent(name));
        }
    }
}
