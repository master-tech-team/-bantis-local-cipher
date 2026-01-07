import { SecureStorage } from '@bantis/local-cipher';

/**
 * Basic Example: Drop-in replacement for localStorage
 * 
 * This example shows the simplest use case - storing and retrieving
 * encrypted data with the same API as localStorage.
 */

async function basicExample() {
    console.log('=== Basic Example ===\n');

    // Get singleton instance
    const storage = SecureStorage.getInstance();

    // Store encrypted data
    console.log('Storing encrypted token...');
    await storage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U');

    // Retrieve decrypted data
    console.log('Retrieving decrypted token...');
    const token = await storage.getItem('accessToken');
    console.log('Token:', token);

    // Check if item exists
    const exists = await storage.hasItem('accessToken');
    console.log('Token exists:', exists);

    // Store user data
    const userData = {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com'
    };

    console.log('\nStoring user data...');
    await storage.setItem('user', JSON.stringify(userData));

    // Retrieve and parse
    const storedUser = await storage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    console.log('User:', user);

    // Remove item
    console.log('\nRemoving token...');
    await storage.removeItem('accessToken');

    const tokenAfterRemove = await storage.getItem('accessToken');
    console.log('Token after remove:', tokenAfterRemove); // null

    // Get debug info
    console.log('\nDebug Info:');
    const debugInfo = storage.getDebugInfo();
    console.log('Crypto supported:', debugInfo.cryptoSupported);
    console.log('Encrypted keys:', debugInfo.encryptedKeys.length);
    console.log('Total keys:', debugInfo.totalKeys);

    // Clear all
    console.log('\nClearing all encrypted data...');
    storage.clear();
    console.log('Done!');
}

// Run example
basicExample().catch(console.error);
