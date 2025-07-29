// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔐 Paste your config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAWSUZyDOd-4Sznsm-kgSxd3UN12lszXkQ",
  authDomain: "trailblazer-be.firebaseapp.com",
  projectId: "trailblazer-be",
  storageBucket: "trailblazer-be.firebasestorage.app",
  messagingSenderId: "804122677057",
  appId: "1:804122677057:web:96e739cb9bb5992ec11bc0",
  measurementId: "G-2DS1QE0TF8"
};


// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
