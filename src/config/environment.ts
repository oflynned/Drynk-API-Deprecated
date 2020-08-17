export class Environment {
  static getNodeEnv() {
    return process.env.NODE_ENV || 'development';
  }

  static isProduction() {
    return Environment.getNodeEnv() === 'production';
  }

  static isDevelopment() {
    return Environment.getNodeEnv() === 'development';
  }

  static isTest() {
    return Environment.getNodeEnv() === 'test';
  }
}
