// Replace with real keys when deploying
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAPD5J3SqUNOpphbCxYHmAtgem3oa6wPR8",
  authDomain: "road-issues-tana.firebaseapp.com",
  projectId: "road-issues-tana",
  storageBucket: "road-issues-tana.firebasestorage.app",
  messagingSenderId: "562033559368",
  appId: "1:562033559368:web:9d5bcb4a2ae2c7f626957d",
  measurementId: "G-7ET5SMNJZ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firestore simple (le SDK détecte automatiquement la région)
const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage };
