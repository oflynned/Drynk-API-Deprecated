import { ConnectionOptions } from 'mongoize-orm';

const productionConfig: ConnectionOptions = {
  uri: process.env.MONGODB_URI
};

const developmentConfig: ConnectionOptions = {
  uri: 'mongodb://localhost:27017/drynk',
  appendDatabaseEnvironment: true
};

export const dbConfig = (): ConnectionOptions => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return productionConfig;
  }

  return developmentConfig;
};
