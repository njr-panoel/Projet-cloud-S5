import { auth } from '../environments/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';

export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  },
  async logout(): Promise<void> {
    await signOut(auth);
  },
  onChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
};
