import admin, { AppOptions } from 'firebase-admin';

// const serviceAccountConfig = () => process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccountConfig = () => require('../config/firebase-service-account.json');

export const firebaseConfig = (): AppOptions => {
  return {
    credential: admin.credential.cert(serviceAccountConfig()),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  };
};
