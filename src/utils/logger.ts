import type { LogLevel, DebugConfig } from '../types';

/**
 * Logger utility for debug mode
 */
export class Logger {
    private enabled: boolean;
    private logLevel: LogLevel;
    private prefix: string;

    private static readonly LOG_LEVELS: Record<LogLevel, number> = {
        silent: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        verbose: 5,
    };

    constructor(config: DebugConfig = {}) {
        this.enabled = config.enabled ?? false;
        this.logLevel = config.logLevel ?? 'info';
        this.prefix = config.prefix ?? 'SecureStorage';
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.enabled) return false;
        return Logger.LOG_LEVELS[level] <= Logger.LOG_LEVELS[this.logLevel];
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        return `[${this.prefix}] [${level.toUpperCase()}] ${timestamp} - ${message}`;
    }

    error(message: string, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message), ...args);
        }
    }

    verbose(message: string, ...args: any[]): void {
        if (this.shouldLog('verbose')) {
            console.log(this.formatMessage('verbose', message), ...args);
        }
    }

    time(label: string): void {
        if (this.enabled && this.shouldLog('debug')) {
            console.time(`[${this.prefix}] ${label}`);
        }
    }

    timeEnd(label: string): void {
        if (this.enabled && this.shouldLog('debug')) {
            console.timeEnd(`[${this.prefix}] ${label}`);
        }
    }

    group(label: string): void {
        if (this.enabled && this.shouldLog('debug')) {
            console.group(`[${this.prefix}] ${label}`);
        }
    }

    groupEnd(): void {
        if (this.enabled && this.shouldLog('debug')) {
            console.groupEnd();
        }
    }
}
