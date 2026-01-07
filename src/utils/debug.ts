import { EncryptionHelper } from '../core/EncryptionHelper';
import { SecureStorage } from '../core/SecureStorage';

const secureStorage = SecureStorage.getInstance();

/**
 * Función de debug para verificar el estado del sistema de encriptación
 * Muestra información detallada en la consola
 */
export async function debugEncryptionState(): Promise<void> {
    console.group('🔐 Estado del Sistema de Encriptación');

    console.log('Soporte Crypto API:', EncryptionHelper.isSupported());

    // Obtener información de debug
    const debugInfo = secureStorage.getDebugInfo();

    console.log('Claves encriptadas:', debugInfo.encryptedKeys.length);
    console.log('Claves sin encriptar:', debugInfo.unencryptedKeys);
    console.log('Total de claves:', debugInfo.totalKeys);

    if (debugInfo.encryptedKeys.length > 0) {
        console.log('✅ Datos encriptados encontrados:');
        debugInfo.encryptedKeys.forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`  ${key}: ${value?.substring(0, 30)}...`);
        });
    } else {
        console.log('⚠️ No se encontraron datos encriptados');
    }

    if (debugInfo.unencryptedKeys.length > 0) {
        console.log('⚠️ Claves sin encriptar encontradas:');
        debugInfo.unencryptedKeys.forEach(key => {
            console.log(`  ${key}`);
        });
    }

    console.groupEnd();
}

/**
 * Fuerza la migración de claves comunes a formato encriptado
 * Útil para desarrollo y testing
 */
export async function forceMigration(customKeys?: string[]): Promise<void> {
    const defaultKeys = [
        'accessToken',
        'refreshToken',
        'user',
        'sessionId',
        'authToken',
        'userData',
    ];

    const keysToMigrate = customKeys || defaultKeys;

    console.log(`🔄 Iniciando migración forzada de ${keysToMigrate.length} claves...`);

    await secureStorage.migrateExistingData(keysToMigrate);

    console.log('✅ Migración forzada completada');

    // Mostrar estado después de la migración
    await debugEncryptionState();
}

/**
 * Limpia todos los datos encriptados (útil para testing)
 */
export function clearAllEncryptedData(): void {
    console.log('🗑️ Limpiando todos los datos encriptados...');
    secureStorage.clear();
    console.log('✅ Datos encriptados limpiados');
}

/**
 * Prueba el sistema de encriptación con datos de ejemplo
 */
export async function testEncryption(): Promise<void> {
    console.group('🧪 Prueba del Sistema de Encriptación');

    try {
        const testKey = '__test_encryption_key';
        const testValue = 'Este es un valor de prueba con caracteres especiales: áéíóú ñ 你好 🔐';

        console.log('1. Guardando valor de prueba...');
        await secureStorage.setItem(testKey, testValue);
        console.log('✅ Valor guardado');

        console.log('2. Recuperando valor...');
        const retrieved = await secureStorage.getItem(testKey);
        console.log('✅ Valor recuperado:', retrieved);

        console.log('3. Verificando integridad...');
        if (retrieved === testValue) {
            console.log('✅ Integridad verificada - Los valores coinciden');
        } else {
            console.error('❌ Error de integridad - Los valores NO coinciden');
            console.log('Original:', testValue);
            console.log('Recuperado:', retrieved);
        }

        console.log('4. Limpiando valor de prueba...');
        await secureStorage.removeItem(testKey);
        console.log('✅ Valor eliminado');

        console.log('5. Verificando eliminación...');
        const shouldBeNull = await secureStorage.getItem(testKey);
        if (shouldBeNull === null) {
            console.log('✅ Eliminación verificada');
        } else {
            console.error('❌ El valor no fue eliminado correctamente');
        }

        console.log('\n✅ Todas las pruebas pasaron exitosamente');
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }

    console.groupEnd();
}
