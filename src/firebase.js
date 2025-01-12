// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ייבוא המודול של Authentication

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVSHryvjH-fyJYkvXOOcBdVHIBnBRFi-4",
  authDomain: "nationthemoney.firebaseapp.com",
  projectId: "nationthemoney",
  storageBucket: "nationthemoney.appspot.com", // תוקן לשימוש נכון ב-appspot.com
  messagingSenderId: "65668379170",
  appId: "1:65668379170:web:9f20b997b0bdadc69a107b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
