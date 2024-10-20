// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJPpNNHVpFPEHjWg9b9THnsT4psC9Fd7E",
  authDomain: "crmv-2.firebaseapp.com",
  projectId: "crmv-2",
  storageBucket: "crmv-2.appspot.com",
  messagingSenderId: "227587511829",
  appId: "1:227587511829:web:4d54a13ed18b106134a01c",
  measurementId: "G-LLK858HVM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);