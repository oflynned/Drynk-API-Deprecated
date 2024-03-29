// In this file you can configure migrate-mongo
const { ConnectionStringParser } = require('connection-string-parser');
const dbUri = require('./dist/config/database.config').dbConfig().uri;

const connectionStringParser = new ConnectionStringParser({
  // To support mongodb atlas connectionstring too
  scheme: dbUri.startsWith('mongodb+srv://') ? 'mongodb+srv' : 'mongodb',
  hosts: []
});

const { endpoint: dbName } = connectionStringParser.parse(dbUri);

module.exports = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: dbUri,

    // TODO Change this to your database name:
    databaseName: dbName,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'dist/migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog'
};
