// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "firebase/firestore"; // Full import to ensure it's bundled

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAt7OGF6A5OiuoWKX8hwAVS2NCwL7TCcKg",
  authDomain: "copy-of-lumina-59103777-1395a.firebaseapp.com",
  projectId: "copy-of-lumina-59103777-1395a",
  storageBucket: "copy-of-lumina-59103777-1395a.firebasestorage.app",
  messagingSenderId: "955887379882",
  appId: "1:955887379882:web:2925dd526428a6326677d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
