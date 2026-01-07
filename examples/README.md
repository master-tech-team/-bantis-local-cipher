# Examples

This directory contains examples demonstrating various features of @bantis/local-cipher.

## Running Examples

```bash
# Install dependencies
npm install

# Run basic example
npx ts-node examples/basic.ts

# Run advanced example
npx ts-node examples/advanced.ts

# Run React example
cd examples/react-app && npm install && npm start

# Run Angular example
cd examples/angular-app && npm install && npm start
```

## Examples

### 1. basic.ts
Drop-in replacement for localStorage with automatic encryption/decryption.

**Features:**
- Basic CRUD operations
- JSON serialization
- Debug info

**Use case:** Simple token storage

### 2. advanced.ts
Enterprise features for production applications.

**Features:**
- TTL/Expiration with auto-cleanup
- Event monitoring
- Namespace isolation
- Integrity validation
- Key rotation

**Use case:** Session management, multi-tenant apps

### 3. react-app/
Complete React application with hooks integration.

**Features:**
- `useSecureStorage` hook
- `useSecureStorageWithExpiry` hook
- `useSecureStorageEvents` hook
- Event-driven UI updates

**Use case:** React SPA with authentication

### 4. angular-app/
Complete Angular application with service integration.

**Features:**
- Injectable `SecureStorageService`
- RxJS observables
- Event streams
- TypeScript decorators

**Use case:** Angular enterprise app

## Quick Start

### JavaScript/TypeScript

```typescript
import { SecureStorage } from '@bantis/local-cipher';

const storage = SecureStorage.getInstance();

// Store
await storage.setItem('key', 'value');

// Retrieve
const value = await storage.getItem('key');

// Remove
await storage.removeItem('key');
```

### React

```tsx
import { useSecureStorage } from '@bantis/local-cipher';

function App() {
  const [token, setToken, loading] = useSecureStorage('token', '');
  
  return <div>{loading ? 'Loading...' : token}</div>;
}
```

### Angular

```typescript
import { SecureStorageService } from '@bantis/local-cipher';

@Component({...})
export class AppComponent {
  token$ = this.storage.getItem('token');
  
  constructor(private storage: SecureStorageService) {}
}
```

## Best Practices

1. **Use TTL for sensitive data**
   ```typescript
   await storage.setItemWithExpiry('token', jwt, { expiresIn: 3600000 });
   ```

2. **Monitor events**
   ```typescript
   storage.on('expired', () => redirectToLogin());
   ```

3. **Organize with namespaces**
   ```typescript
   const userStorage = storage.namespace('user');
   const appStorage = storage.namespace('app');
   ```

4. **Clear on logout**
   ```typescript
   storage.clear();
   ```

5. **Rotate keys periodically**
   ```typescript
   await storage.rotateKeys();
   ```

## Need Help?

- [Documentation](../README.md)
- [API Reference](../README.md#api-reference)
- [Security Policy](../SECURITY.md)
- [GitHub Issues](https://github.com/master-tech-team/-bantis-local-cipher/issues)
