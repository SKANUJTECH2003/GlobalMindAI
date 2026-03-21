/**
 * Centralized Logging Service
 * Replaces scattered console.log statements with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: LogLevel[] = ['error', 'warn'];

  constructor() {
    if (this.isDevelopment) {
      this.enabledLevels = ['debug', 'info', 'warn', 'error'];
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.includes(level);
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), data || '');
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error || '');
    }
  }

  // Structured logging for performance metrics
  performance(operation: string, duration: number): void {
    if (this.shouldLog('info')) {
      const message = `⏱️ ${operation} completed in ${duration}ms`;
      console.info(this.formatMessage('info', message));
    }
  }

  // Structured logging for state changes
  stateChange(component: string, oldState: any, newState: any): void {
    if (this.shouldLog('debug')) {
      const message = `STATE: ${component}`;
      console.debug(this.formatMessage('debug', message), { old: oldState, new: newState });
    }
  }
}

export const logger = new Logger();
