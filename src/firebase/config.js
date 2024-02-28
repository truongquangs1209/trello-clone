// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

// import "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzvr-h3yQJRDrwNeILPT9pLhGkgf4KCxM",
  authDomain: "trello-clone-c6e29.firebaseapp.com",
  projectId: "trello-clone-c6e29",
  storageBucket: "trello-clone-c6e29.appspot.com",
  messagingSenderId: "257170210342",
  appId: "1:257170210342:web:b9c24618e451ef4123f0e7",
  measurementId: "G-NYQ4SK33M3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);

const db = getFirestore(app);
if (process.env.NODE_ENV === "development") {
  // Kết nối với Firestore emulator
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
}

export { db, auth };
