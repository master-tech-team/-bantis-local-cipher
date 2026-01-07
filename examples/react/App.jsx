import React, { useState } from 'react';
import { useSecureStorage, useSecureStorageDebug } from '@mtt/local-cipher';

function App() {
    const [token, setToken, tokenLoading, tokenError] = useSecureStorage('accessToken', '');
    const [user, setUser, userLoading] = useSecureStorage('user', { name: '', email: '' });
    const debugInfo = useSecureStorageDebug();

    const [inputToken, setInputToken] = useState('');
    const [inputName, setInputName] = useState('');
    const [inputEmail, setInputEmail] = useState('');

    const handleSaveToken = async () => {
        await setToken(inputToken);
        setInputToken('');
    };

    const handleSaveUser = async () => {
        await setUser({ name: inputName, email: inputEmail });
        setInputName('');
        setInputEmail('');
    };

    const handleClearToken = async () => {
        await setToken('');
    };

    if (tokenLoading || userLoading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>🔄 Cargando datos encriptados...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>🔐 @mtt/local-cipher</h1>
                <p style={styles.subtitle}>Ejemplo con React Hooks</p>
            </header>

            {tokenError && (
                <div style={styles.error}>
                    ❌ Error: {tokenError.message}
                </div>
            )}

            {/* Sección de Token */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Access Token</h2>

                <div style={styles.displayBox}>
                    <strong>Token actual:</strong>
                    <p style={styles.value}>{token || '(vacío)'}</p>
                </div>

                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                        placeholder="Ingresa un nuevo token"
                        style={styles.input}
                    />
                    <button onClick={handleSaveToken} style={styles.button}>
                        💾 Guardar Token
                    </button>
                    <button onClick={handleClearToken} style={{ ...styles.button, ...styles.dangerButton }}>
                        🗑️ Limpiar
                    </button>
                </div>
            </section>

            {/* Sección de Usuario */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Datos de Usuario (Objeto)</h2>

                <div style={styles.displayBox}>
                    <strong>Usuario actual:</strong>
                    <pre style={styles.json}>{JSON.stringify(user, null, 2)}</pre>
                </div>

                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Nombre"
                        style={styles.input}
                    />
                    <input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        placeholder="Email"
                        style={styles.input}
                    />
                    <button onClick={handleSaveUser} style={styles.button}>
                        💾 Guardar Usuario
                    </button>
                </div>
            </section>

            {/* Información de Debug */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Información del Sistema</h2>

                <div style={styles.debugGrid}>
                    <div style={styles.debugCard}>
                        <h3 style={styles.debugLabel}>Crypto API</h3>
                        <p style={styles.debugValue}>{debugInfo.cryptoSupported ? '✅' : '❌'}</p>
                    </div>
                    <div style={styles.debugCard}>
                        <h3 style={styles.debugLabel}>Claves Encriptadas</h3>
                        <p style={styles.debugValue}>{debugInfo.encryptedKeys.length}</p>
                    </div>
                    <div style={styles.debugCard}>
                        <h3 style={styles.debugLabel}>Claves Sin Encriptar</h3>
                        <p style={styles.debugValue}>{debugInfo.unencryptedKeys.length}</p>
                    </div>
                    <div style={styles.debugCard}>
                        <h3 style={styles.debugLabel}>Total</h3>
                        <p style={styles.debugValue}>{debugInfo.totalKeys}</p>
                    </div>
                </div>

                {debugInfo.unencryptedKeys.length > 0 && (
                    <div style={styles.warning}>
                        ⚠️ Claves sin encriptar detectadas: {debugInfo.unencryptedKeys.join(', ')}
                    </div>
                )}
            </section>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        color: 'white',
        fontSize: '2.5rem',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1.25rem',
    },
    loading: {
        textAlign: 'center',
        color: 'white',
        fontSize: '1.5rem',
        padding: '4rem',
    },
    error: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        maxWidth: '800px',
        margin: '0 auto 1rem',
    },
    section: {
        maxWidth: '800px',
        margin: '0 auto 2rem',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },
    sectionTitle: {
        color: '#333',
        marginBottom: '1.5rem',
        fontSize: '1.5rem',
    },
    displayBox: {
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
    },
    value: {
        fontFamily: 'monospace',
        fontSize: '1rem',
        marginTop: '0.5rem',
        wordBreak: 'break-all',
    },
    json: {
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        overflow: 'auto',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    input: {
        padding: '0.75rem',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'border-color 0.3s',
    },
    button: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    dangerButton: {
        background: '#dc3545',
    },
    debugGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
    },
    debugCard: {
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        borderLeft: '4px solid #667eea',
    },
    debugLabel: {
        fontSize: '0.875rem',
        color: '#666',
        marginBottom: '0.5rem',
    },
    debugValue: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#333',
    },
    warning: {
        background: '#fff3cd',
        color: '#856404',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
    },
};

export default App;
