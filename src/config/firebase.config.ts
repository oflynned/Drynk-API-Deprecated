import admin, { AppOptions } from 'firebase-admin';

// const serviceAccountConfig = () => process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccountConfig = () => {
  return process.env.NODE_ENV === 'production' ? process.env.FIREBASE_SERVICE_ACCOUNT : require('../config/firebase-service-account.json');
};

export const firebaseConfig = (): AppOptions => {
  return {
    credential: admin.credential.cert(serviceAccountConfig()),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  };
};
