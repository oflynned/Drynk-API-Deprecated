export class Logger {
  readonly _namespace: string;

  constructor(namespace: string) {
    this._namespace = namespace;
  }

  static getInstance(namespace: string) {
    return new Logger(namespace);
  }

  error(...value: any): void {
    console.error(this.formatLog('error', value));
  }

  warn(...value: any): void {
    console.warn(this.formatLog('warn', value));
  }

  info(...value: any): void {
    console.info(this.formatLog('info', value));
  }

  debug(...value: any): void {
    console.debug(this.formatLog('debug', value));
  }

  private formatLog(level: string, ...value: any): string {
    return `[${this._namespace}] ${level.toUpperCase()}: ${value}`;
  }
}
