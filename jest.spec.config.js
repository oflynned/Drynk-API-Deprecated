const config = require('./jest.config');
config.testMatch = ['**/*.spec.ts'];

console.info('Running unit tests ...\n');

module.exports = config;
