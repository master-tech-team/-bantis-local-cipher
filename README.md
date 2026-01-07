# @bantis/local-cipher

[![npm version](https://img.shields.io/npm/v/@bantis/local-cipher.svg)](https://www.npmjs.com/package/@bantis/local-cipher)
[![npm downloads](https://img.shields.io/npm/dm/@bantis/local-cipher.svg)](https://www.npmjs.com/package/@bantis/local-cipher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

**Client-side encryption for localStorage using AES-256-GCM**

Protect sensitive data in browser storage from XSS attacks, local file access, and casual inspection. Drop-in replacement for localStorage with automatic encryption/decryption.

## Problem

localStorage stores data in **plain text**. Anyone with access to DevTools, browser files, or malicious scripts can read:
- Authentication tokens
- User credentials
- API keys
- Personal information

## Solution

Transparent AES-256-GCM encryption with browser fingerprinting. Data is encrypted before storage and decrypted on retrieval. Keys are derived from browser characteristics, making data unreadable outside the original browser context.

## Quick Start

```bash
npm install @bantis/local-cipher
```

```typescript
import { SecureStorage } from '@bantis/local-cipher';

const storage = SecureStorage.getInstance();

// Store encrypted
await storage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Retrieve decrypted
const token = await storage.getItem('token');

// Works like localStorage
await storage.removeItem('token');
storage.clear();
```

**Before:**
```
localStorage: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**After:**
```
localStorage: { "__enc_a7f5d8e2": "Qm9keUVuY3J5cHRlZERhdGE..." }
```

## Features

- ✅ **AES-256-GCM** encryption with authentication
- ✅ **PBKDF2** key derivation (100k+ iterations)
- ✅ **Browser fingerprinting** for unique keys per device
- ✅ **Key obfuscation** - even key names are encrypted
- ✅ **TTL/Expiration** - auto-delete expired data
- ✅ **Event system** - monitor storage operations
- ✅ **Compression** - automatic gzip for large values
- ✅ **Namespaces** - organize data in isolated spaces
- ✅ **Integrity checks** - SHA-256 checksums
- ✅ **TypeScript** - full type definitions
- ✅ **Framework support** - React hooks, Angular service

## Use Cases

### 1. Protect Authentication Tokens

```typescript
// Store JWT with 1-hour expiration
await storage.setItemWithExpiry('accessToken', jwt, { 
  expiresIn: 3600000 
});

// Auto-cleanup expired tokens
storage.on('expired', ({ key }) => {
  console.log(`Token ${key} expired, redirecting to login`);
  window.location.href = '/login';
});
```

### 2. Secure User Preferences

```typescript
const userStorage = storage.namespace('user');
await userStorage.setItem('theme', 'dark');
await userStorage.setItem('language', 'en');

// Isolated from other namespaces
const appStorage = storage.namespace('app');
```

### 3. Cache Sensitive API Responses

```typescript
// Store with compression for large data
const storage = SecureStorage.getInstance({
  storage: { compression: true, compressionThreshold: 512 }
});

await storage.setItem('userData', JSON.stringify(largeObject));
```

## React Integration

```tsx
import { useSecureStorage, useSecureStorageEvents } from '@bantis/local-cipher';

function App() {
  const [token, setToken, loading] = useSecureStorage('token', '');
  
  useSecureStorageEvents('expired', () => {
    // Handle expiration
  });

  if (loading) return <div>Loading...</div>;
  
  return <div>Token: {token}</div>;
}
```

## Angular Integration

```typescript
import { SecureStorageService } from '@bantis/local-cipher';

@Component({...})
export class AppComponent {
  token$ = this.storage.getItem('token');

  constructor(private storage: SecureStorageService) {
    this.storage.events$.subscribe(event => {
      console.log('Storage event:', event);
    });
  }
}
```

## Configuration

```typescript
const storage = SecureStorage.getInstance({
  encryption: {
    iterations: 150000,      // PBKDF2 iterations
    keyLength: 256,          // 128, 192, or 256 bits
    saltLength: 16,          // Salt size in bytes
    ivLength: 12,            // IV size in bytes
  },
  storage: {
    compression: true,       // Enable gzip compression
    compressionThreshold: 1024,  // Compress if > 1KB
    autoCleanup: true,       // Auto-delete expired items
    cleanupInterval: 60000   // Cleanup every 60s
  },
  debug: {
    enabled: false,          // Enable debug logging
    logLevel: 'info'         // silent, error, warn, info, debug, verbose
  }
});
```

## Security

### What This Protects Against

✅ **XSS attacks** - Encrypted data is useless without the browser-specific key  
✅ **Local file access** - Malware reading browser files gets encrypted data  
✅ **Casual inspection** - DevTools shows encrypted values  
✅ **Data tampering** - Integrity checks detect modifications  

### What This Does NOT Protect Against

❌ **Server-side attacks** - Encryption is client-side only  
❌ **Man-in-the-Middle** - Use HTTPS for data in transit  
❌ **Memory dumps** - Keys exist in memory during runtime  
❌ **Compromised browser** - If the browser is compromised, all bets are off  
❌ **Physical access during active session** - Data is decrypted when accessed  

### Best Practices

1. **Use HTTPS** - Always transmit data over secure connections
2. **Short TTLs** - Set expiration on sensitive data
3. **Clear on logout** - Call `storage.clear()` when user logs out
4. **Monitor events** - Track suspicious activity via event listeners
5. **Rotate keys** - Periodically call `storage.rotateKeys()`
6. **Don't store passwords** - Never store plaintext passwords, even encrypted

## Browser Support

Requires [Web Crypto API](https://caniuse.com/cryptography):

- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 12+
- Opera 24+

**Fallback:** Gracefully degrades to unencrypted localStorage in unsupported browsers.

## API Reference

### Core Methods

```typescript
setItem(key: string, value: string): Promise<void>
getItem(key: string): Promise<string | null>
removeItem(key: string): Promise<void>
hasItem(key: string): Promise<boolean>
clear(): void
```

### Expiration

```typescript
setItemWithExpiry(key: string, value: string, options: {
  expiresIn?: number;    // milliseconds from now
  expiresAt?: Date;      // absolute date
}): Promise<void>

cleanExpired(): Promise<number>  // Returns count of deleted items
```

### Events

```typescript
on(event: StorageEventType, listener: EventListener): void
off(event: StorageEventType, listener: EventListener): void
once(event: StorageEventType, listener: EventListener): void

// Event types: 'encrypted', 'decrypted', 'deleted', 'cleared', 
//              'expired', 'error', 'keyRotated', 'compressed'
```

### Namespaces

```typescript
namespace(name: string): NamespacedStorage

const userStorage = storage.namespace('user');
await userStorage.setItem('profile', data);
await userStorage.clearNamespace();
```

### Key Rotation

```typescript
rotateKeys(): Promise<void>
exportEncryptedData(): Promise<EncryptedBackup>
importEncryptedData(backup: EncryptedBackup): Promise<void>
```

## FAQ

**Q: Is this secure enough for passwords?**  
A: No. Never store passwords in localStorage, even encrypted. Use secure, httpOnly cookies or sessionStorage with server-side session management.

**Q: Can data be decrypted on another device?**  
A: No. Keys are derived from browser fingerprinting. Data encrypted on Chrome/Windows cannot be decrypted on Firefox/Mac.

**Q: What happens if Web Crypto API is unavailable?**  
A: The library falls back to unencrypted localStorage with a console warning. Check `EncryptionHelper.isSupported()` to detect support.

**Q: Does this protect against XSS?**  
A: Partially. It makes stolen data harder to use, but XSS can still intercept data when it's decrypted in memory. Use CSP headers and sanitize inputs.

**Q: How is this different from sessionStorage?**  
A: sessionStorage is cleared on tab close. This provides persistent, encrypted storage across sessions.

**Q: Can I use this in Node.js?**  
A: No. This library requires browser APIs (Web Crypto, localStorage). For Node.js, use native `crypto` module.

**Q: What's the performance impact?**  
A: Encryption adds ~2-5ms per operation. Compression adds ~5-10ms for large values. Negligible for most use cases.

## Migration from v1

v1 data is automatically migrated to v2 format on first read. No action required.

```typescript
// v1 and v2 are API-compatible
const storage = SecureStorage.getInstance();  // Works with both
```

## Examples

See [/examples](./examples) directory for:
- Basic usage
- React integration
- Angular integration
- Advanced features (TTL, events, namespaces)

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## Security Issues

Report security vulnerabilities to [security@example.com](mailto:security@example.com). See [SECURITY.md](./SECURITY.md) for details.

## License

MIT © MTT - See [LICENSE](./LICENSE) for details.

## Links

- [npm package](https://www.npmjs.com/package/@bantis/local-cipher)
- [GitHub repository](https://github.com/master-tech-team/-bantis-local-cipher)
- [Changelog](./CHANGELOG.md)
- [Security Policy](./SECURITY.md)
