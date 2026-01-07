# @mtt/local-cipher

[![npm version](https://img.shields.io/npm/v/@mtt/local-cipher.svg)](https://www.npmjs.com/package/@mtt/local-cipher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-master--tech--team-blue)](https://github.com/master-tech-team/mtt-local-cipher)

Librería de cifrado local AES-256-GCM para proteger datos sensibles en localStorage. Compatible con **Angular**, **React** y **JavaScript vanilla**.

## 🔐 Características

- ✅ **Cifrado AES-256-GCM** - Estándar de cifrado avanzado con autenticación
- ✅ **Derivación de claves PBKDF2** - 100,000 iteraciones con SHA-256
- ✅ **Browser Fingerprinting** - Claves únicas por navegador
- ✅ **Ofuscación de nombres** - Los nombres de las claves también se encriptan
- ✅ **TypeScript** - Tipado completo
- ✅ **Framework Agnostic** - Funciona con cualquier proyecto JavaScript
- ✅ **Integraciones específicas** - Hooks de React y servicio de Angular
- ✅ **Migración automática** - Convierte datos existentes a formato encriptado
- ✅ **Fallback transparente** - Funciona en navegadores sin Web Crypto API

## 📦 Instalación

```bash
npm install @mtt/local-cipher
```

## 🚀 Uso Rápido

### JavaScript Vanilla

```javascript
import { secureStorage } from '@mtt/local-cipher';

// Guardar datos encriptados
await secureStorage.setItem('accessToken', 'mi-token-secreto');

// Leer datos desencriptados
const token = await secureStorage.getItem('accessToken');

// Eliminar datos
await secureStorage.removeItem('accessToken');

// Limpiar todo
secureStorage.clear();
```

### React

```jsx
import { useSecureStorage } from '@mtt/local-cipher';

function App() {
  const [token, setToken, loading] = useSecureStorage('accessToken', '');

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
import { SecureStorageService } from '@mtt/local-cipher';

@Component({
  selector: 'app-root',
  template: `<div>{{ token$ | async }}</div>`
})
export class AppComponent {
  token$ = this.secureStorage.getItem('accessToken');

  constructor(private secureStorage: SecureStorageService) {}

  saveToken(token: string) {
    this.secureStorage.setItem('accessToken', token).subscribe();
  }
}
```

## 📚 Documentación Completa

### API Principal

#### `SecureStorage`

**`setItem(key: string, value: string): Promise<void>`**
Guarda un valor encriptado en localStorage.

**`getItem(key: string): Promise<string | null>`**
Recupera y desencripta un valor de localStorage.

**`removeItem(key: string): Promise<void>`**
Elimina un valor de localStorage.

**`hasItem(key: string): Promise<boolean>`**
Verifica si existe una clave.

**`clear(): void`**
Limpia todos los datos encriptados.

**`migrateExistingData(keys: string[]): Promise<void>`**
Migra datos existentes no encriptados a formato encriptado.

### React Hooks

#### `useSecureStorage<T>(key: string, initialValue: T)`
Hook principal para usar SecureStorage de forma reactiva.

```jsx
const [user, setUser, loading, error] = useSecureStorage('user', null);
```

**Retorna:** `[value, setValue, loading, error]`

#### `useSecureStorageItem(key: string)`
Verifica si existe una clave.

```jsx
const [hasToken, loading, error] = useSecureStorageItem('accessToken');
```

**Retorna:** `[exists, loading, error]`

#### `useSecureStorageDebug()`
Obtiene información de debug del sistema.

```jsx
const debugInfo = useSecureStorageDebug();
console.log(`Claves encriptadas: ${debugInfo.encryptedKeys.length}`);
```

### Angular Service

#### `SecureStorageService`

```typescript
// Inyectar el servicio
constructor(private secureStorage: SecureStorageService) {}

// Guardar
this.secureStorage.setItem('key', 'value').subscribe();

// Leer
this.secureStorage.getItem('key').subscribe(value => console.log(value));

// Guardar objetos JSON
this.secureStorage.setObject('user', { id: 1, name: 'Juan' }).subscribe();

// Leer objetos JSON
this.secureStorage.getObject<User>('user').subscribe(user => console.log(user));

// Obtener debug info como Observable
this.secureStorage.getDebugInfo$().subscribe(info => console.log(info));
```

## 🔄 Migración de Datos Existentes

Si ya tienes datos en localStorage sin encriptar, puedes migrarlos fácilmente:

```javascript
import { secureStorage } from '@mtt/local-cipher';

// Migrar claves específicas
await secureStorage.migrateExistingData([
  'accessToken',
  'refreshToken',
  'user',
  'sessionId'
]);
```

**Recomendación:** Ejecuta esto al iniciar tu aplicación para migrar automáticamente.

## 🛡️ Seguridad

### ¿Qué protege?

✅ **XSS (Cross-Site Scripting)** - Los datos están encriptados incluso si un script malicioso accede a localStorage  
✅ **Lectura de archivos locales** - Malware que lee archivos del navegador no puede descifrar los datos  
✅ **Ofuscación** - Los nombres de las claves también están encriptados  

### ¿Qué NO protege?

❌ **Ataques del lado del servidor** - La encriptación es solo del lado del cliente  
❌ **Man-in-the-Middle** - Usa HTTPS para proteger datos en tránsito  
❌ **Acceso físico durante sesión activa** - Si el navegador está abierto, la clave está en memoria  

### Cómo Funciona

1. **Fingerprinting del navegador** - Se genera una huella digital única combinando características del navegador
2. **Derivación de clave** - Se usa PBKDF2 con 100,000 iteraciones para derivar una clave AES-256
3. **Cifrado AES-GCM** - Cada valor se encripta con un IV aleatorio único
4. **Almacenamiento** - Se guarda `IV + datos encriptados` en Base64

**Ejemplo de localStorage:**

```
Antes:
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  user: '{"id":1,"name":"Juan"}'

Después:
  __enc_a7f5d8e2c1b4: "Qm9keUVuY3J5cHRlZERhdGE..."
  __enc_9c3e7b1a5f8d: "QW5vdGhlckVuY3J5cHRlZA..."
  __app_salt: "cmFuZG9tU2FsdEhlcmU="
```

## 🧪 Utilidades de Debug

```javascript
import { debugEncryptionState, testEncryption, forceMigration } from '@mtt/local-cipher';

// Ver estado del sistema
await debugEncryptionState();

// Probar encriptación
await testEncryption();

// Forzar migración
await forceMigration(['accessToken', 'refreshToken']);
```

## 🌐 Compatibilidad

Requiere navegadores con soporte para **Web Crypto API**:

- ✅ Chrome 37+
- ✅ Firefox 34+
- ✅ Safari 11+
- ✅ Edge 12+
- ✅ Opera 24+

**Nota:** En navegadores sin soporte, la librería hace fallback automático a localStorage normal.

## 📄 Licencia

MIT © MTT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue o pull request en GitHub.

## 📞 Soporte

Si encuentras algún problema o tienes preguntas, abre un issue en GitHub.
