import { Component, OnInit } from '@angular/core';
import { SecureStorageService } from '@mtt/local-cipher';
import { Observable } from 'rxjs';

interface User {
    name: string;
    email: string;
}

interface DebugInfo {
    cryptoSupported: boolean;
    encryptedKeys: string[];
    unencryptedKeys: string[];
    totalKeys: number;
}

@Component({
    selector: 'app-root',
    template: `
    <div class="container">
      <header class="header">
        <h1>🔐 @mtt/local-cipher</h1>
        <p class="subtitle">Ejemplo con Angular Service</p>
      </header>

      <!-- Sección de Token -->
      <section class="section">
        <h2>Access Token</h2>
        
        <div class="display-box">
          <strong>Token actual:</strong>
          <p class="value">{{ (token$ | async) || '(vacío)' }}</p>
        </div>

        <div class="input-group">
          <input
            type="text"
            [(ngModel)]="inputToken"
            placeholder="Ingresa un nuevo token"
            class="input"
          />
          <button (click)="saveToken()" class="button">
            💾 Guardar Token
          </button>
          <button (click)="clearToken()" class="button danger">
            🗑️ Limpiar
          </button>
        </div>
      </section>

      <!-- Sección de Usuario -->
      <section class="section">
        <h2>Datos de Usuario (Objeto)</h2>
        
        <div class="display-box">
          <strong>Usuario actual:</strong>
          <pre class="json">{{ (user$ | async) | json }}</pre>
        </div>

        <div class="input-group">
          <input
            type="text"
            [(ngModel)]="inputName"
            placeholder="Nombre"
            class="input"
          />
          <input
            type="email"
            [(ngModel)]="inputEmail"
            placeholder="Email"
            class="input"
          />
          <button (click)="saveUser()" class="button">
            💾 Guardar Usuario
          </button>
        </div>
      </section>

      <!-- Información de Debug -->
      <section class="section">
        <h2>Información del Sistema</h2>
        
        <div class="debug-grid" *ngIf="debugInfo$ | async as debugInfo">
          <div class="debug-card">
            <h3>Crypto API</h3>
            <p class="debug-value">{{ debugInfo.cryptoSupported ? '✅' : '❌' }}</p>
          </div>
          <div class="debug-card">
            <h3>Claves Encriptadas</h3>
            <p class="debug-value">{{ debugInfo.encryptedKeys.length }}</p>
          </div>
          <div class="debug-card">
            <h3>Claves Sin Encriptar</h3>
            <p class="debug-value">{{ debugInfo.unencryptedKeys.length }}</p>
          </div>
          <div class="debug-card">
            <h3>Total</h3>
            <p class="debug-value">{{ debugInfo.totalKeys }}</p>
          </div>
        </div>

        <div class="warning" *ngIf="(debugInfo$ | async)?.unencryptedKeys.length > 0">
          ⚠️ Claves sin encriptar detectadas: {{ (debugInfo$ | async)?.unencryptedKeys.join(', ') }}
        </div>

        <button (click)="migrateData()" class="button secondary">
          🔄 Migrar Datos Existentes
        </button>
      </section>
    </div>
  `,
    styles: [`
    .container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    h1 {
      color: white;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1.25rem;
    }

    .section {
      max-width: 800px;
      margin: 0 auto 2rem;
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    h2 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .display-box {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .value {
      font-family: monospace;
      font-size: 1rem;
      margin-top: 0.5rem;
      word-break: break-all;
    }

    .json {
      font-family: monospace;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      overflow: auto;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .input {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .input:focus {
      outline: none;
      border-color: #667eea;
    }

    .button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .button:hover {
      transform: translateY(-2px);
    }

    .button.danger {
      background: #dc3545;
    }

    .button.secondary {
      background: #6c757d;
    }

    .debug-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .debug-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .debug-card h3 {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.5rem;
    }

    .debug-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }

    .warning {
      background: #fff3cd;
      color: #856404;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
  `]
})
export class AppComponent implements OnInit {
    token$: Observable<string | null>;
    user$: Observable<User | null>;
    debugInfo$: Observable<DebugInfo>;

    inputToken = '';
    inputName = '';
    inputEmail = '';

    constructor(private secureStorage: SecureStorageService) {
        this.token$ = this.secureStorage.getItem('accessToken');
        this.user$ = this.secureStorage.getObject<User>('user');
        this.debugInfo$ = this.secureStorage.getDebugInfo$();
    }

    ngOnInit(): void {
        // Opcional: migrar datos al iniciar
        // this.migrateData();
    }

    saveToken(): void {
        this.secureStorage.setItem('accessToken', this.inputToken).subscribe(() => {
            this.inputToken = '';
            this.token$ = this.secureStorage.getItem('accessToken');
        });
    }

    clearToken(): void {
        this.secureStorage.setItem('accessToken', '').subscribe(() => {
            this.token$ = this.secureStorage.getItem('accessToken');
        });
    }

    saveUser(): void {
        const user: User = {
            name: this.inputName,
            email: this.inputEmail
        };

        this.secureStorage.setObject('user', user).subscribe(() => {
            this.inputName = '';
            this.inputEmail = '';
            this.user$ = this.secureStorage.getObject<User>('user');
        });
    }

    migrateData(): void {
        const keysToMigrate = ['accessToken', 'refreshToken', 'user', 'sessionId'];
        this.secureStorage.migrateExistingData(keysToMigrate).subscribe(() => {
            console.log('✅ Migración completada');
        });
    }
}
