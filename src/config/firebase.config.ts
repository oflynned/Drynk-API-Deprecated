import admin, { AppOptions } from 'firebase-admin';

const serviceAccountConfig = () => {
  return process.env.NODE_ENV === 'production'
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('./secrets/firebase-service-account.json');
};

export const firebaseConfig = (): AppOptions => {
  return {
    credential: admin.credential.cert(serviceAccountConfig()),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  };
};
