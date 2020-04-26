import { ConnectionOptions } from 'mongoize-orm';

const productionConfig = (): ConnectionOptions => {
  return {
    uri: process.env.MONGODB_URI
  };
};

const developmentConfig = (): ConnectionOptions => {
  return {
    uri: 'mongodb://localhost:27017/drynk',
    appendDatabaseEnvironment: true
  };
};

export const dbConfig = (): ConnectionOptions => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return productionConfig();
  }

  return developmentConfig();
};
