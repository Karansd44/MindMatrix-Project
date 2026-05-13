/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, connectFirestoreEmulator } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

const useEmulators = (import.meta as any).env?.VITE_USE_FIREBASE_EMULATORS === 'true';

export const db = initializeFirestore(
  app,
  { experimentalForceLongPolling: true },
  useEmulators ? undefined : firebaseConfig.firestoreDatabaseId,
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to emulators when running locally on the device or in Vite dev.
if (useEmulators) {
  try {
    const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
    const host = isAndroid ? '10.0.2.2' : 'localhost';
    connectAuthEmulator(auth, `http://${host}:9099`);
    connectFirestoreEmulator(db, host, 8080);
    console.log('Connected to Firebase emulators using host:', host);
  } catch (error) {
    console.warn('Failed to connect to Firebase emulators:', error);
  }
} else {
  console.log('Using live Firebase services for auth and Firestore');
}

// Test connection
async function testConnection() {
  try {
    const result = await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firebase connection successful');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("❌ Firebase offline: Please check your internet connection.");
      } else if (error.message.includes('Permission denied')) {
        console.warn("⚠️ Firebase connected but test collection blocked (expected - security rules)");
      } else {
        console.warn("⚠️ Firebase connection test:", error.message);
      }
    }
  }
}
testConnection();
