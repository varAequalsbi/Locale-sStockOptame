import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase API Key is missing! Check your .env file.");
}

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "localestockoptame");