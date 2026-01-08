// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// We use Environment Variables so your keys are not public on GitHub
const firebaseConfig = {

  apiKey: "AIzaSyBJQuONWd3yROCM5e9_LtChSwVWPAKTDnw",

  authDomain: "stockoptamelocale.firebaseapp.com",

  projectId: "stockoptamelocale",

  storageBucket: "stockoptamelocale.firebasestorage.app",

  messagingSenderId: "536081509072",

  appId: "1:536081509072:web:26570bff254ab22ce90cd5",

  measurementId: "G-S4G1N7CC9W"

};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);