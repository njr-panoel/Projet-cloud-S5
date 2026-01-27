import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../environments/firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const signOut = () => fbSignOut(auth);
export const onAuthChanged = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

export const addSignalementToFirestore = async (payload: any) => {
  const col = collection(db, 'signalements');
  const docRef = await addDoc(col, { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return docRef.id;
};

export const uploadPhotoBase64 = async (base64: string, path: string) => {
  const ref = storageRef(storage, path);
  // base64 should be data_url like 'data:image/jpeg;base64,...'
  await uploadString(ref, base64, 'data_url');
  return await getDownloadURL(ref);
};

export const listenSignalements = (cb: Function) => {
  const col = collection(db, 'signalements');
  const q = query(col, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items: any[] = [];
    snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
    cb(items);
  });
};

export const updateSignalement = async (id: string, data: any) => {
  const d = doc(db, 'signalements', id);
  await updateDoc(d, { ...data, updatedAt: serverTimestamp() });
};