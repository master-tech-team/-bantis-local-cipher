# Changelog

## [2.0.0] - 2026-01-06

### 🚀 Major Release - Enterprise Features

#### Breaking Changes
- **Constructor Change**: `SecureStorage.getInstance()` now accepts optional `SecureStorageConfig` parameter
- **Internal Format**: Data now stored in `StoredValue` wrapper format (automatic migration from v1)
- **Minimum Requirements**: Requires modern browsers with CompressionStream API for compression features

#### New Features
- ✨ **Configurable Encryption**: Customize iterations, salt length, IV length, key length (128/192/256 bits)
- 🎯 **Event System**: Listen to storage events (encrypted, decrypted, deleted, expired, error, etc.)
- 🗜️ **Data Compression**: Automatic gzip compression for values > 1KB (configurable threshold)
- ⏰ **Expiration Support**: Set TTL on items with `setItemWithExpiry()` and automatic cleanup
- 🔐 **Integrity Validation**: SHA-256 checksums for data integrity verification
- 📦 **Namespaces**: Organize data with isolated namespaces
- 🔄 **Key Rotation**: Rotate encryption keys with `rotateKeys()` and backup/restore functionality
- 📊 **Debug Mode**: Comprehensive logging with configurable log levels
- 🔧 **TypeScript**: Full type definitions for all features

#### Migration from v1
```typescript
// v1
const storage = SecureStorage.getInstance();

// v2 (backward compatible)
const storage = SecureStorage.getInstance();

// v2 with configuration
const storage = SecureStorage.getInstance({
  encryption: { iterations: 150000, keyLength: 256 },
  compression: true,
  debug: { enabled: true, logLevel: 'verbose' }
});
```

Data migration is automatic and transparent. v1 data will be auto-migrated to v2 format on first read.


All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-06

### Added
- Initial release of @mtt/local-cipher
- AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations)
- Browser fingerprinting for unique encryption keys
- `EncryptionHelper` class for low-level encryption operations
- `SecureStorage` singleton class with localStorage-like API
- React hooks: `useSecureStorage`, `useSecureStorageItem`, `useSecureStorageDebug`
- Angular service: `SecureStorageService` with RxJS Observables
- Automatic data migration from unencrypted to encrypted format
- Debug utilities for monitoring encryption status
- Fallback to plain localStorage when Web Crypto API is unavailable
- Full TypeScript support with type declarations
- CommonJS and ES Module builds
- Comprehensive documentation and examples

### Security
- Implements AES-256-GCM authenticated encryption
- Uses PBKDF2 with 100,000 iterations for key derivation
- Generates unique 96-bit IV for each encryption operation
- Encrypts both key names and values in localStorage
- Browser fingerprinting prevents cross-device decryption

[1.0.0]: https://github.com/master-tech-team/-bantis-local-cipher/releases/tag/v1.0.0
