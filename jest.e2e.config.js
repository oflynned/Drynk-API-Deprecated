const config = require('./jest.config');
config.testMatch = ['**/*.e2e.ts'];

console.info('Running e2e tests ...\n');

module.exports = config;
