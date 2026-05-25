import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from "firebase/auth";
import { app } from "./config";

let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await updateProfile(cred.user, { displayName });
  return cred;
}

export async function logout() {
  return signOut(getFirebaseAuth());
}
