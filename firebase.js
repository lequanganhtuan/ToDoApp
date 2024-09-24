// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACqyWte8AYHRXCy-dzXp9Xshb507Ks_dM",
  authDomain: "todoapp-9262f.firebaseapp.com",
  projectId: "todoapp-9262f",
  storageBucket: "todoapp-9262f.appspot.com",
  messagingSenderId: "743626858183",
  appId: "1:743626858183:web:489074a9e4254c321428e2",
  measurementId: "G-RRZ5Z1SL7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };