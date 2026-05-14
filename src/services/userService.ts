import { db } from '../lib/firebase';
import { User } from '../types';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

/**
 * Create or update a user profile in `users/{uid}`.
 * If the document exists it will be merged.
 */
export async function createUserProfile(uid: string, userProfile: Partial<User>) {
  if (!uid) throw new Error('Missing uid for user profile');
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, { ...userProfile, updatedAt: Timestamp.now(), createdAt: (userProfile as any).createdAt || Timestamp.now() }, { merge: true });
    return { ok: true, id: uid };
  } catch (err) {
    console.error('Failed to create/update user profile', err);
    throw err;
  }
}

export async function getUserDocRef(uid: string) {
  return doc(db, 'users', uid);
}
