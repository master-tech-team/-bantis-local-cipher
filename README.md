# @bantis/local-cipher v2.0.0

[![npm version](https://img.shields.io/npm/v/@bantis/local-cipher.svg)](https://www.npmjs.com/package/@bantis/local-cipher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-master--tech--team-blue)](https://github.com/master-tech-team/-bantis-local-cipher)

Librería enterprise de cifrado local AES-256-GCM con **configuración personalizable**, **eventos**, **compresión**, **expiración**, **namespaces** y **rotación de claves**. Compatible con **Angular**, **React** y **JavaScript vanilla**.

## ✨ Novedades v2.0.0

- 🎛️ **Configuración Personalizable** - Ajusta iteraciones, longitud de clave, salt e IV
- 🎯 **Sistema de Eventos** - Escucha eventos de cifrado, expiración, errores, etc.
- 🗜️ **Compresión Automática** - Gzip para valores > 1KB (configurable)
- ⏰ **Expiración/TTL** - Establece tiempo de vida con auto-limpieza
- 🔐 **Validación de Integridad** - Checksums SHA-256 automáticos
- 📦 **Namespaces** - Organiza datos en espacios aislados
- 🔄 **Rotación de Claves** - Re-encripta datos con nuevas claves
- 📊 **Modo Debug** - Logging configurable con niveles

## 📦 Instalación

```bash
npm install @bantis/local-cipher
```

## 🚀 Uso Rápido

### JavaScript Vanilla

```javascript
import { SecureStorage } from '@bantis/local-cipher';

const storage = SecureStorage.getInstance();

// Guardar datos encriptados
await storage.setItem('accessToken', 'mi-token-secreto');

// Leer datos desencriptados
const token = await storage.getItem('accessToken');

// Con expiración (1 hora)
await storage.setItemWithExpiry('session', sessionData, { expiresIn: 3600000 });

// Eliminar datos
await storage.removeItem('accessToken');
```

### Con Configuración Personalizada

```javascript
const storage = SecureStorage.getInstance({
  encryption: {
    iterations: 150000,      // PBKDF2 iterations (default: 100000)
    keyLength: 256,          // 128, 192, or 256 bits
    saltLength: 16,          // Salt size in bytes
    ivLength: 12,            // IV size in bytes
    appIdentifier: 'my-app'  // Custom app identifier
  },
  storage: {
    compression: true,              // Enable compression
    compressionThreshold: 1024,     // Compress if > 1KB
    autoCleanup: true,              // Auto-clean expired items
    cleanupInterval: 60000          // Cleanup every 60s
  },
  debug: {
    enabled: true,           // Enable debug logging
    logLevel: 'verbose',     // silent, error, warn, info, debug, verbose
    prefix: 'MyApp'          // Log prefix
  }
});
```

### React

```jsx
import { useSecureStorage, useSecureStorageWithExpiry, useSecureStorageEvents } from '@bantis/local-cipher';

function App() {
  // Hook básico
  const [token, setToken, loading] = useSecureStorage('accessToken', '');
  
  // Hook con expiración
  const [session, setSession] = useSecureStorageWithExpiry(
    'session', 
    null, 
    { expiresIn: 3600000 }
  );
  
  // Escuchar eventos
  useSecureStorageEvents('expired', (data) => {
    console.log('Item expired:', data.key);
  });
  
  // Usar namespace
  const userStorage = useNamespace('user');

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <p>Token: {token}</p>
      <button onClick={() => setToken('nuevo-token')}>
        Actualizar Token
      </button>
    </div>
  );
}
```

### Angular

```typescript
import { SecureStorageService } from '@bantis/local-cipher';

@Component({
  selector: 'app-root',
  template: `
    <div>{{ token$ | async }}</div>
    <button (click)="saveToken()">Guardar</button>
  `
})
export class AppComponent implements OnInit {
  token$ = this.storage.getItem('accessToken');

  constructor(private storage: SecureStorageService) {}
  
  ngOnInit() {
    // Escuchar eventos
    this.storage.events$.subscribe(event => {
      console.log('Storage event:', event);
    });
    
    // Eventos específicos
    this.storage.onEvent$('expired').subscribe(event => {
      console.log('Item expired:', event.key);
    });
  }

  saveToken() {
    this.storage.setItemWithExpiry('token', 'value', { expiresIn: 3600000 })
      .subscribe();
  }
  
  saveObject() {
    this.storage.setObjectWithExpiry('user', { id: 1 }, { expiresIn: 7200000 })
      .subscribe();
  }
}
```

## 📚 API Completa

### SecureStorage

#### Métodos Básicos

```typescript
setItem(key: string, value: string): Promise<void>
getItem(key: string): Promise<string | null>
removeItem(key: string): Promise<void>
hasItem(key: string): Promise<boolean>
clear(): void
```

#### Expiración

```typescript
setItemWithExpiry(key: string, value: string, options: ExpiryOptions): Promise<void>
cleanExpired(): Promise<number>

// Opciones
interface ExpiryOptions {
  expiresIn?: number;    // Milisegundos desde ahora
  expiresAt?: Date;      // Fecha absoluta
}
```

#### Eventos

```typescript
on(event: StorageEventType, listener: EventListener): void
once(event: StorageEventType, listener: EventListener): void
off(event: StorageEventType, listener: EventListener): void
removeAllListeners(event?: StorageEventType): void

// Tipos de eventos
type StorageEventType = 
  | 'encrypted' | 'decrypted' | 'deleted' | 'cleared' 
  | 'expired' | 'error' | 'keyRotated' | 'compressed' | 'decompressed';
```

#### Namespaces

```typescript
namespace(name: string): NamespacedStorage

// Ejemplo
const userStorage = storage.namespace('user');
const sessionStorage = storage.namespace('session');

await userStorage.setItem('profile', data);
await userStorage.clearNamespace(); // Solo limpia este namespace
```

#### Integridad

```typescript
verifyIntegrity(key: string): Promise<boolean>
getIntegrityInfo(key: string): Promise<IntegrityInfo>

interface IntegrityInfo {
  valid: boolean;
  lastModified: number;
  checksum: string;
  version: number;
}
```

#### Rotación de Claves

```typescript
rotateKeys(): Promise<void>
exportEncryptedData(): Promise<EncryptedBackup>
importEncryptedData(backup: EncryptedBackup): Promise<void>

// Ejemplo
const backup = await storage.exportEncryptedData();
await storage.rotateKeys();
// Si algo sale mal:
await storage.importEncryptedData(backup);
```

#### Debug

```typescript
getDebugInfo(): {
  cryptoSupported: boolean;
  encryptedKeys: string[];
  unencryptedKeys: string[];
  totalKeys: number;
  config: SecureStorageConfig;
}
```

## 🎯 Casos de Uso

### 1. Session Management con Expiración

```javascript
// Guardar sesión que expira en 30 minutos
await storage.setItemWithExpiry('session', sessionData, { 
  expiresIn: 30 * 60 * 1000 
});

// Auto-limpieza cada minuto
const storage = SecureStorage.getInstance({
  storage: { autoCleanup: true, cleanupInterval: 60000 }
});
```

### 2. Organización con Namespaces

```javascript
const userStorage = storage.namespace('user');
const appStorage = storage.namespace('app');
const tempStorage = storage.namespace('temp');

await userStorage.setItem('profile', userData);
await appStorage.setItem('settings', appSettings);
await tempStorage.setItem('cache', cacheData);

// Limpiar solo datos temporales
await tempStorage.clearNamespace();
```

### 3. Monitoreo con Eventos

```javascript
storage.on('encrypted', ({ key, metadata }) => {
  console.log(`✅ Encrypted: ${key}`, metadata);
});

storage.on('expired', ({ key }) => {
  console.warn(`⏰ Expired: ${key}`);
  // Refrescar datos o redirigir a login
});

storage.on('error', ({ key, error }) => {
  console.error(`❌ Error on ${key}:`, error);
  // Enviar a sistema de logging
});
```

### 4. Rotación de Claves Programada

```javascript
// Rotar claves cada 30 días
setInterval(async () => {
  console.log('Rotating encryption keys...');
  const backup = await storage.exportEncryptedData();
  
  try {
    await storage.rotateKeys();
    console.log('Keys rotated successfully');
  } catch (error) {
    console.error('Rotation failed, restoring backup');
    await storage.importEncryptedData(backup);
  }
}, 30 * 24 * 60 * 60 * 1000);
```

## 🔄 Migración desde v1

### Cambios Principales

**v1:**
```javascript
const storage = SecureStorage.getInstance();
```

**v2 (compatible):**
```javascript
// Funciona igual que v1
const storage = SecureStorage.getInstance();

// O con configuración
const storage = SecureStorage.getInstance({
  encryption: { iterations: 150000 }
});
```

### Migración Automática

Los datos de v1 se migran automáticamente al leerlos. No requiere acción del usuario.

```javascript
// v1 data format: plain encrypted string
// v2 data format: JSON with metadata

// Al hacer getItem(), v1 data se detecta y migra automáticamente
const value = await storage.getItem('oldKey'); // ✅ Migrado a v2
```

## 🛡️ Seguridad

### Protección

✅ **XSS** - Datos encriptados incluso si script malicioso accede a localStorage  
✅ **Lectura local** - Malware no puede descifrar sin la clave del navegador  
✅ **Ofuscación** - Nombres de claves encriptados  
✅ **Integridad** - Checksums SHA-256 detectan manipulación  

### Limitaciones

❌ **Servidor** - Encriptación solo cliente  
❌ **MITM** - Usa HTTPS  
❌ **Sesión activa** - Clave en memoria durante uso  

### Arquitectura

1. **Fingerprinting** - Huella única del navegador
2. **PBKDF2** - 100,000+ iteraciones para derivar clave
3. **AES-256-GCM** - Cifrado con autenticación
4. **SHA-256** - Checksums de integridad
5. **Gzip** - Compresión opcional

## 🌐 Compatibilidad

- ✅ Chrome 37+
- ✅ Firefox 34+
- ✅ Safari 11+
- ✅ Edge 12+
- ✅ Opera 24+

**Fallback:** En navegadores sin Web Crypto API, usa localStorage normal.

## 📄 Licencia

MIT © MTT

## 🔗 Enlaces

- [GitHub](https://github.com/master-tech-team/-bantis-local-cipher)
- [npm](https://www.npmjs.com/package/@bantis/local-cipher)
- [Changelog](./CHANGELOG.md)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Abre un issue o pull request en GitHub.
