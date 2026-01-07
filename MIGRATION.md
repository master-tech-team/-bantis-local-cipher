# Migration Guide: v2.0.x → v2.1.0

## Overview

v2.1.0 introduces **conditional exports** to eliminate framework dependency conflicts. This is a **breaking change** for React and Angular users.

## Problem Solved

**v2.0.x Issue:**
```
Error: Could not resolve "@angular/core" imported by "@bantis/local-cipher"
```

React/Vue/Vanilla JS projects were forced to install Angular dependencies or create mocks, even though they didn't use Angular features.

**v2.1.0 Solution:**
- Core bundle: No framework dependencies (42KB)
- React bundle: Core + React hooks (49KB)
- Angular bundle: Core + Angular service (55KB)

## Migration Steps

### 1. For React Users

**Update imports:**

```diff
- import { useSecureStorage } from '@bantis/local-cipher';
+ import { useSecureStorage } from '@bantis/local-cipher/react';
```

**All React hooks:**
```typescript
import {
  useSecureStorage,
  useSecureStorageItem,
  useSecureStorageWithExpiry,
  useSecureStorageEvents,
  useNamespace,
  useSecureStorageDebug,
  initializeSecureStorage
} from '@bantis/local-cipher/react';
```

**Core classes still available:**
```typescript
import { SecureStorage } from '@bantis/local-cipher/react';  // Re-exported from core
```

### 2. For Angular Users

**Update imports:**

```diff
- import { SecureStorageService } from '@bantis/local-cipher';
+ import { SecureStorageService } from '@bantis/local-cipher/angular';
```

**Core classes still available:**
```typescript
import { SecureStorage } from '@bantis/local-cipher/angular';  // Re-exported from core
```

### 3. For Core/Vanilla JS Users

**No changes required:**
```typescript
import { SecureStorage } from '@bantis/local-cipher';  // Still works
```

## Automated Migration

### Using find-and-replace

**For React projects:**
```bash
# Find all imports
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@bantis/local-cipher"

# Replace (macOS/Linux)
find src -name "*.ts" -o -name "*.tsx" -exec sed -i '' "s/'@bantis\/local-cipher'/'@bantis\/local-cipher\/react'/g" {} +

# Replace (Linux)
find src -name "*.ts" -o -name "*.tsx" -exec sed -i "s/'@bantis\/local-cipher'/'@bantis\/local-cipher\/react'/g" {} +
```

**For Angular projects:**
```bash
# Replace (macOS)
find src -name "*.ts" -exec sed -i '' "s/'@bantis\/local-cipher'/'@bantis\/local-cipher\/angular'/g" {} +

# Replace (Linux)
find src -name "*.ts" -exec sed -i "s/'@bantis\/local-cipher'/'@bantis\/local-cipher\/angular'/g" {} +
```

### Using VS Code

1. Open Find and Replace (Cmd/Ctrl + Shift + H)
2. Find: `from '@bantis/local-cipher'`
3. Replace with:
   - React: `from '@bantis/local-cipher/react'`
   - Angular: `from '@bantis/local-cipher/angular'`
4. Replace All

## Verification

### Check bundle size

**Before (v2.0.x):**
```
Bundle size: ~60KB (includes all frameworks)
```

**After (v2.1.0):**
```
Core only: ~42KB (30% smaller)
React: ~49KB
Angular: ~55KB
```

### Verify no dependency errors

**React (Vite):**
```bash
npm run build
# Should complete without "@angular/core" errors
```

**Angular:**
```bash
ng build
# Should work as before
```

## Rollback

If you need to rollback to v2.0.1:

```bash
npm install @bantis/local-cipher@2.0.1
```

Then revert import changes.

## Benefits

✅ **40% smaller bundles** for non-framework users  
✅ **No dependency conflicts** - each framework isolated  
✅ **Better tree-shaking** - unused code eliminated  
✅ **Clearer API** - explicit framework imports  
✅ **Future-proof** - easy to add Vue, Svelte, etc.

## Support

If you encounter issues:
1. Check [GitHub Issues](https://github.com/master-tech-team/-bantis-local-cipher/issues)
2. Review [README.md](./README.md)
3. Open a new issue with:
   - Framework (React/Angular/Vanilla)
   - Build tool (Vite/Webpack/etc)
   - Error message
   - Minimal reproduction

## Timeline

- **v2.0.x:** Deprecated (still works, but not recommended)
- **v2.1.0:** Current stable
- **v2.2.0:** Planned for Q2 2026 (see [ROADMAP.md](./ROADMAP.md))
