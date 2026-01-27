// Replace with real keys when deploying
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAPD5J3SqUNOpphbCxYHmAtgem3oa6wPR8",
  authDomain: "road-issues-tana.firebaseapp.com",
  databaseURL: "https://road-issues-tana-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "road-issues-tana",
  storageBucket: "road-issues-tana.firebasestorage.app",
  messagingSenderId: "562033559368",
  appId: "1:562033559368:web:9d5bcb4a2ae2c7f626957d",
  measurementId: "G-7ET5SMNJZ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

enableIndexedDbPersistence(db).catch(() => {
  // Persistence best-effort; silently continue if already enabled/unsupported
});

export { app, auth, db, storage };
