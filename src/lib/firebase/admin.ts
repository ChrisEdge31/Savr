import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;
  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }
  _adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Vercel stores multiline env vars with literal \n — unescape them
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return _adminApp;
}

export function getAdminDb(): Firestore {
  if (_adminDb) return _adminDb;
  getAdminApp();
  _adminDb = getFirestore();
  return _adminDb;
}
