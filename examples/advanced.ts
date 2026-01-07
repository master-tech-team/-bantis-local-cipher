import { SecureStorage } from '@bantis/local-cipher';

/**
 * Advanced Example: TTL, Events, Namespaces, and Key Rotation
 * 
 * This example demonstrates enterprise features:
 * - Expiration with auto-cleanup
 * - Event monitoring
 * - Namespace isolation
 * - Key rotation
 */

async function advancedExample() {
    console.log('=== Advanced Example ===\n');

    // Initialize with custom configuration
    const storage = SecureStorage.getInstance({
        encryption: {
            iterations: 150000,  // More secure
            keyLength: 256
        },
        storage: {
            compression: true,
            compressionThreshold: 512,
            autoCleanup: true,
            cleanupInterval: 30000  // 30 seconds
        },
        debug: {
            enabled: true,
            logLevel: 'info'
        }
    });

    // === Event Monitoring ===
    console.log('1. Setting up event listeners...\n');

    storage.on('encrypted', ({ key, metadata }) => {
        console.log(`✅ Encrypted: ${key}`, metadata);
    });

    storage.on('decrypted', ({ key }) => {
        console.log(`🔓 Decrypted: ${key}`);
    });

    storage.on('expired', ({ key }) => {
        console.warn(`⏰ Expired: ${key}`);
    });

    storage.on('error', ({ key, error }) => {
        console.error(`❌ Error on ${key}:`, error);
    });

    // === TTL / Expiration ===
    console.log('\n2. Testing expiration...\n');

    // Store with 5-second expiration
    await storage.setItemWithExpiry('shortLivedToken', 'temp-token-123', {
        expiresIn: 5000  // 5 seconds
    });

    console.log('Stored token with 5s TTL');

    // Immediate retrieval works
    let token = await storage.getItem('shortLivedToken');
    console.log('Token (immediate):', token);

    // Wait 6 seconds
    console.log('Waiting 6 seconds...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Should be expired now
    token = await storage.getItem('shortLivedToken');
    console.log('Token (after 6s):', token); // null

    // === Namespaces ===
    console.log('\n3. Testing namespaces...\n');

    const userStorage = storage.namespace('user');
    const sessionStorage = storage.namespace('session');
    const cacheStorage = storage.namespace('cache');

    // Store in different namespaces
    await userStorage.setItem('profile', JSON.stringify({
        id: 1,
        name: 'Alice'
    }));

    await sessionStorage.setItem('token', 'session-token-456');
    await cacheStorage.setItem('apiResponse', JSON.stringify({ data: [] }));

    console.log('Stored data in 3 namespaces');

    // Clear only cache namespace
    await cacheStorage.clearNamespace();
    console.log('Cleared cache namespace');

    // Other namespaces still have data
    const profile = await userStorage.getItem('profile');
    const sessionToken = await sessionStorage.getItem('token');
    const cache = await cacheStorage.getItem('apiResponse');

    console.log('User profile:', profile ? 'exists' : 'null');
    console.log('Session token:', sessionToken ? 'exists' : 'null');
    console.log('Cache:', cache ? 'exists' : 'null');

    // === Integrity Validation ===
    console.log('\n4. Testing integrity validation...\n');

    await storage.setItem('importantData', 'critical-information');

    const isValid = await storage.verifyIntegrity('importantData');
    console.log('Data integrity:', isValid ? 'VALID ✓' : 'INVALID ✗');

    const integrityInfo = await storage.getIntegrityInfo('importantData');
    console.log('Integrity info:', integrityInfo);

    // === Key Rotation ===
    console.log('\n5. Testing key rotation...\n');

    // Store some data
    await storage.setItem('data1', 'value1');
    await storage.setItem('data2', 'value2');
    await storage.setItem('data3', 'value3');

    console.log('Stored 3 items');

    // Export backup before rotation
    console.log('Exporting backup...');
    const backup = await storage.exportEncryptedData();
    console.log(`Backup created with ${backup.metadata.itemCount} items`);

    // Rotate keys (re-encrypts all data)
    console.log('Rotating keys...');
    await storage.rotateKeys();
    console.log('Keys rotated successfully');

    // Verify data still accessible
    const data1 = await storage.getItem('data1');
    const data2 = await storage.getItem('data2');
    const data3 = await storage.getItem('data3');

    console.log('Data after rotation:');
    console.log('  data1:', data1);
    console.log('  data2:', data2);
    console.log('  data3:', data3);

    // === Cleanup ===
    console.log('\n6. Cleanup...\n');

    // Manual cleanup of expired items
    const expiredCount = await storage.cleanExpired();
    console.log(`Cleaned ${expiredCount} expired items`);

    // Final debug info
    const debugInfo = storage.getDebugInfo();
    console.log('\nFinal state:');
    console.log('  Encrypted keys:', debugInfo.encryptedKeys.length);
    console.log('  Total keys:', debugInfo.totalKeys);

    // Cleanup
    storage.destroy();
    console.log('\nDone!');
}

// Run example
advancedExample().catch(console.error);
