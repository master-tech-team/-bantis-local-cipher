# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | ✅ Active support  |
| 1.x     | ⚠️ Security fixes only |
| < 1.0   | ❌ No longer supported |

## What This Library Protects

@bantis/local-cipher provides **client-side encryption** for browser localStorage. It is designed to protect against:

### ✅ Protected Scenarios

1. **XSS Data Theft**
   - Malicious scripts reading localStorage get encrypted data
   - Without browser-specific keys, data is unreadable
   - **Limitation:** XSS can still intercept data when decrypted in memory

2. **Local File Access**
   - Malware reading browser storage files
   - Physical access to disk when browser is closed
   - **Limitation:** Does not protect against memory dumps during runtime

3. **Casual Inspection**
   - DevTools inspection shows encrypted values
   - Key names are obfuscated
   - **Limitation:** Determined attacker with browser access can debug code

4. **Data Tampering**
   - SHA-256 checksums detect modifications
   - GCM authentication prevents bit-flipping attacks
   - **Limitation:** Attacker can delete data entirely

## What This Library Does NOT Protect

### ❌ Not Protected Scenarios

1. **Server-Side Attacks**
   - This is client-side encryption only
   - Server receives decrypted data
   - **Mitigation:** Use HTTPS and server-side encryption

2. **Man-in-the-Middle (MITM)**
   - Data in transit is not protected by this library
   - **Mitigation:** Always use HTTPS

3. **Compromised Browser/Extensions**
   - Malicious browser extensions can access everything
   - **Mitigation:** Use trusted browsers and minimal extensions

4. **Memory Dumps**
   - Keys and decrypted data exist in memory
   - **Mitigation:** Clear sensitive data after use

5. **Physical Access During Active Session**
   - If browser is open and authenticated, data is accessible
   - **Mitigation:** Lock screen when away, implement session timeouts

6. **Brute Force on Weak Data**
   - Encryption doesn't add entropy to weak secrets
   - **Mitigation:** Use strong, random tokens

## Security Best Practices

### For Library Users

1. **Never Store Passwords**
   ```typescript
   // ❌ DON'T
   await storage.setItem('password', userPassword);
   
   // ✅ DO - Use secure, httpOnly cookies
   // Let the server handle password storage
   ```

2. **Use Short TTLs for Sensitive Data**
   ```typescript
   // ✅ DO - Auto-expire tokens
   await storage.setItemWithExpiry('accessToken', token, {
     expiresIn: 3600000  // 1 hour
   });
   ```

3. **Clear on Logout**
   ```typescript
   // ✅ DO - Clear all encrypted data
   function logout() {
     storage.clear();
     // Then redirect to login
   }
   ```

4. **Monitor Events**
   ```typescript
   // ✅ DO - Track suspicious activity
   storage.on('error', ({ key, error }) => {
     logSecurityEvent('storage_error', { key, error });
   });
   ```

5. **Rotate Keys Periodically**
   ```typescript
   // ✅ DO - Rotate every 30 days
   setInterval(async () => {
     const backup = await storage.exportEncryptedData();
     await storage.rotateKeys();
   }, 30 * 24 * 60 * 60 * 1000);
   ```

6. **Use HTTPS Always**
   - Never transmit sensitive data over HTTP
   - Enable HSTS headers
   - Use secure cookies

7. **Implement CSP Headers**
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'
   ```

8. **Validate Data After Decryption**
   ```typescript
   const data = await storage.getItem('userData');
   if (data && isValidUserData(data)) {
     // Use data
   }
   ```

### For Library Maintainers

1. **Dependency Security**
   - Run `npm audit` regularly
   - Keep dependencies updated
   - Minimize dependency tree

2. **Code Review**
   - All crypto-related changes require review
   - Test coverage > 80%
   - No hardcoded secrets

3. **Disclosure Policy**
   - Responsible disclosure window: 90 days
   - Credit security researchers
   - Publish CVEs for confirmed vulnerabilities

## Reporting a Vulnerability

**DO NOT** open public issues for security vulnerabilities.

### How to Report

1. **Email:** security@example.com
2. **Subject:** [SECURITY] @bantis/local-cipher - Brief description
3. **Include:**
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** 
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-60 days
  - Low: 60-90 days

### Disclosure Process

1. We confirm the vulnerability
2. We develop and test a fix
3. We release a patched version
4. We publish a security advisory
5. We credit the reporter (unless they prefer anonymity)

## Known Limitations

### Browser Fingerprinting

- **Issue:** Fingerprints can change (browser updates, extensions)
- **Impact:** Data becomes unreadable after fingerprint change
- **Mitigation:** Use `storage.migrateExistingData()` or backup/restore

### Web Crypto API Availability

- **Issue:** Not available in all browsers/contexts
- **Impact:** Falls back to unencrypted storage
- **Mitigation:** Check `EncryptionHelper.isSupported()` before use

### localStorage Limits

- **Issue:** 5-10MB storage limit per origin
- **Impact:** Encryption + compression overhead reduces available space
- **Mitigation:** Use compression, clean expired data regularly

### Same-Origin Policy

- **Issue:** Data is accessible to all scripts on same origin
- **Impact:** XSS on your domain can access encrypted data
- **Mitigation:** Implement strict CSP, sanitize all inputs

## Cryptographic Details

### Algorithms

- **Encryption:** AES-256-GCM (NIST approved)
- **Key Derivation:** PBKDF2-SHA256 (100,000+ iterations)
- **Integrity:** SHA-256 checksums
- **Compression:** gzip (RFC 1952)

### Key Generation

1. Browser fingerprint generated from:
   - User agent
   - Screen resolution
   - Color depth
   - Timezone
   - Custom app identifier

2. Fingerprint hashed with SHA-256

3. Random salt generated (16 bytes default)

4. Key derived using PBKDF2:
   - Input: fingerprint hash
   - Salt: random 16 bytes
   - Iterations: 100,000 (configurable)
   - Output: 256-bit AES key

### Encryption Process

1. Generate random IV (12 bytes)
2. Encrypt plaintext with AES-256-GCM
3. Compute SHA-256 checksum
4. Store: `{ value, iv, checksum, metadata }`

### Threat Model

**Assumed Attacker Capabilities:**
- Read localStorage files
- Execute JavaScript in browser context
- Access DevTools
- Read network traffic (if not HTTPS)

**Assumed Secure:**
- Web Crypto API implementation
- Browser's random number generator
- User's device (no keyloggers/malware)

## Security Changelog

### v2.0.0 (2026-01-06)
- Added SHA-256 integrity checks
- Implemented key rotation
- Added event monitoring
- Increased default PBKDF2 iterations to 100,000

### v1.0.1 (Previous)
- Initial release
- AES-256-GCM encryption
- PBKDF2 key derivation

## References

- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [Web Crypto API Specification](https://www.w3.org/TR/WebCryptoAPI/)
- [NIST SP 800-38D (GCM)](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [NIST SP 800-132 (PBKDF2)](https://csrc.nist.gov/publications/detail/sp/800-132/final)
