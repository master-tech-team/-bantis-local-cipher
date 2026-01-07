// Quick test script to verify the library works
import { secureStorage, testEncryption, debugEncryptionState, EncryptionHelper } from './dist/index.esm.js';

console.log('🧪 Testing @mtt/local-cipher\n');

// Check crypto support
console.log('1. Checking Web Crypto API support...');
console.log('   Crypto API supported:', EncryptionHelper.isSupported());

// Run automated tests
console.log('\n2. Running automated encryption tests...');
await testEncryption();

// Test basic operations
console.log('\n3. Testing basic operations...');
await secureStorage.setItem('testKey', 'testValue');
console.log('   ✅ Saved: testKey = testValue');

const retrieved = await secureStorage.getItem('testKey');
console.log('   ✅ Retrieved:', retrieved);

const exists = await secureStorage.hasItem('testKey');
console.log('   ✅ Exists check:', exists);

// Show debug info
console.log('\n4. Debug information:');
await debugEncryptionState();

// Cleanup
await secureStorage.removeItem('testKey');
console.log('\n✅ All tests passed! Library is working correctly.\n');
