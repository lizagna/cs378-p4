// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCx6sQDS1_Q6zR6r-mkRRXS_ahVvlFMUfw",
  authDomain: "cs378-p4-44ab8.firebaseapp.com",
  databaseURL: "https://cs378-p4-44ab8-default-rtdb.firebaseio.com",
  projectId: "cs378-p4-44ab8",
  storageBucket: "cs378-p4-44ab8.appspot.com",
  messagingSenderId: "905685201369",
  appId: "1:905685201369:web:5360e28411c814a518e9c8",
  measurementId: "G-F0YB4XKSVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export const db = getDatabase(app);
// Initialize Firebase Authentication and get a reference to the service

export const auth = getAuth(app);

export default app;