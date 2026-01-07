# Changelog

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
