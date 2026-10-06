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
import { setDoc } from "firebase/firestore";
import { app } from "./config";
import { leaderboardDoc, userDoc } from "./firestore";

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

/** Updates the display name on the auth profile, the user doc and the public leaderboard entry. */
export async function updateDisplayName(uid: string, displayName: string) {
  await updateProfile(getFirebaseAuth().currentUser!, { displayName });
  await setDoc(userDoc(uid), { displayName } as Parameters<typeof setDoc>[1], { merge: true });
  await setDoc(leaderboardDoc(uid), { displayName } as Parameters<typeof setDoc>[1], { merge: true });
}
