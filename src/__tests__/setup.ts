// Mock Web Crypto API for tests
const crypto = require('crypto');

Object.defineProperty(global, 'crypto', {
    value: {
        subtle: crypto.webcrypto.subtle,
        getRandomValues: (arr: Uint8Array) => crypto.randomBytes(arr.length),
    },
});

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock btoa/atob
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
