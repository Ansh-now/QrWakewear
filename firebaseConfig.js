import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/* Provided config — replace with your project's values if needed */
const firebaseConfig = {
  apiKey: "AIz...Aqg",
  authDomain: "wakewear-263f4.firebaseapp.com",
  databaseURL: "https://wakewear-263f4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wakewear-263f4",
  storageBucket: "wakewear-263f4.firebasestorage.app",
  messagingSenderId: "643812915543",
  appId: "1:643812915543:web:06542bb469321da98ae612",
  measurementId: "G-1CC56HQSXC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);