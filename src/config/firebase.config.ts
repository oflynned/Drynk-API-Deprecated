import admin, { AppOptions } from 'firebase-admin';

const serviceAccountConfig = () => {
  return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
};

export const firebaseConfig = (): AppOptions => {
  return {
    credential: admin.credential.cert(serviceAccountConfig()),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  };
};
