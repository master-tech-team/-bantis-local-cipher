# Roadmap

## Vision

Build the most secure, developer-friendly client-side encryption library for browser storage. Make encryption the default, not an afterthought.

---

## Released

### v2.0.0 (January 2026) ✅

**Theme:** Enterprise Features

- ✅ Configurable encryption parameters
- ✅ Event system (9 event types)
- ✅ Automatic gzip compression
- ✅ TTL/Expiration with auto-cleanup
- ✅ SHA-256 integrity validation
- ✅ Namespace isolation
- ✅ Key rotation with backup/restore
- ✅ Debug logging (6 log levels)
- ✅ Complete TypeScript types
- ✅ React hooks (v2)
- ✅ Angular service (v2)

**Impact:** Production-ready for enterprise applications

### v1.0.1 (2025) ✅

**Theme:** Core Functionality

- ✅ AES-256-GCM encryption
- ✅ PBKDF2 key derivation (100k iterations)
- ✅ Browser fingerprinting
- ✅ Key name obfuscation
- ✅ Basic React hooks
- ✅ Basic Angular service
- ✅ Automatic migration
- ✅ Fallback for unsupported browsers

**Impact:** Secure localStorage replacement

---

## Planned

### v2.1.0 (Q1 2026) 🎯

**Theme:** Developer Experience

**Features:**
- [ ] CLI tool for key management
- [ ] Browser extension for debugging
- [ ] Migration tool for other encryption libraries
- [ ] Performance benchmarks
- [ ] Bundle size optimization (<50KB)

**Goals:**
- Improve DX with better tooling
- Reduce bundle size by 30%
- Add comprehensive benchmarks

### v2.2.0 (Q2 2026)

**Theme:** Advanced Security

**Features:**
- [ ] Multi-key encryption (encrypt different data with different keys)
- [ ] Hardware security module (HSM) support
- [ ] Secure key backup to cloud (encrypted)
- [ ] Audit logging
- [ ] Compliance mode (GDPR, HIPAA helpers)

**Goals:**
- Support regulated industries
- Enable enterprise compliance
- Improve key management

### v2.3.0 (Q2 2026)

**Theme:** Cross-Platform

**Features:**
- [ ] React Native support
- [ ] Electron support
- [ ] IndexedDB backend (for large data)
- [ ] Cross-tab synchronization
- [ ] Offline-first support

**Goals:**
- Expand beyond web browsers
- Support mobile and desktop apps
- Enable larger data storage

### v3.0.0 (Q3 2026)

**Theme:** Next-Generation Crypto

**Breaking Changes:**
- [ ] Upgrade to post-quantum cryptography (when standardized)
- [ ] WebAuthn integration for key derivation
- [ ] Passkey support
- [ ] Zero-knowledge proofs for data verification

**Goals:**
- Future-proof against quantum computers
- Leverage modern authentication standards
- Improve security without complexity

---

## Under Consideration

**Community Requests:**
- Server-side encryption helpers (Node.js)
- Vue.js composition API
- Svelte stores integration
- Web Workers support for background encryption
- Streaming encryption for large files
- Multi-device sync (with server component)

**Research:**
- Homomorphic encryption for computation on encrypted data
- Differential privacy for analytics
- Secure multi-party computation

---

## Completed Milestones

| Milestone | Date | Description |
|-----------|------|-------------|
| First Release | 2025 | v1.0.0 - Core encryption |
| npm Publication | 2025 | Public package available |
| TypeScript Rewrite | 2025 | Full type safety |
| Enterprise Features | Jan 2026 | v2.0.0 - Events, TTL, namespaces |
| 1K Downloads | TBD | Community adoption |
| Production Use | TBD | First enterprise deployment |

---

## Contributing

Want to influence the roadmap?

1. **Vote on features:** Comment on [GitHub Discussions](https://github.com/master-tech-team/-bantis-local-cipher/discussions)
2. **Propose features:** Open a [feature request](https://github.com/master-tech-team/-bantis-local-cipher/issues/new?template=feature_request.md)
3. **Contribute code:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major (x.0.0):** Breaking changes
- **Minor (2.x.0):** New features, backward compatible
- **Patch (2.0.x):** Bug fixes, backward compatible

---

## Support Timeline

| Version | Release | End of Support |
|---------|---------|----------------|
| 3.x | Q3 2026 | TBD |
| 2.x | Jan 2026 | Jan 2028 (2 years) |
| 1.x | 2025 | Jan 2027 (security fixes only) |

---

## Long-Term Vision

**Year 1 (2026):**
- Become the default choice for client-side encryption
- 10K+ npm downloads/month
- 100+ GitHub stars
- Production use in 50+ companies

**Year 2 (2027):**
- Cross-platform support (web, mobile, desktop)
- Enterprise compliance certifications
- 50K+ npm downloads/month
- Active community contributions

**Year 3 (2028):**
- Industry standard for browser encryption
- Post-quantum ready
- 100K+ npm downloads/month
- Self-sustaining open-source project

---

**Last Updated:** January 6, 2026
