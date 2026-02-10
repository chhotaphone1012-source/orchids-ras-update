import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let app: FirebaseApp | any = null;
let auth: Auth | any = null;
let db: Firestore | any = null;
let storage: FirebaseStorage | any = null;

try {
  if (firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    // Mock objects for local development without Firebase config
    auth = { onAuthStateChanged: (cb: any) => () => {}, currentUser: null };
    db = { collection: () => ({ doc: () => ({}) }) };
    storage = {};
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  auth = { onAuthStateChanged: (cb: any) => () => {}, currentUser: null };
  db = { collection: () => ({ doc: () => ({}) }) };
  storage = {};
}

export { auth, db, storage };
