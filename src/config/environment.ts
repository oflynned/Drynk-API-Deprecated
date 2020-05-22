export class Environment {
  static getNodeEnv() {
    return process.env.NODE_ENV || 'development';
  }

  static isProduction() {
    return this.getNodeEnv() === 'production';
  }

  static isDevelopment() {
    return this.getNodeEnv() === 'development';
  }

  static isTest() {
    return this.getNodeEnv() === 'test';
  }
}
