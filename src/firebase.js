import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore"; 

const getEnv = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        console.error(`❌ Missing Environment Variable: ${key}`);
    }
    return value;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};


const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "localestockoptame"); // Only add this if it's NOT (default)