import { db } from '../lib/firebase';
import { Artisan } from '../types';
import { doc, setDoc } from 'firebase/firestore';

export async function saveArtisanProfile(artisan: Artisan) {
  if (!artisan || !artisan.phone) throw new Error('Artisan must have a phone to save as ID');
  try {
    const id = artisan.phone.replace(/\s+/g, '_');
    const ref = doc(db, 'artisans', id);
    await setDoc(ref, artisan, { merge: true });
    console.log('✅ Artisan profile saved successfully');
    return id;
  } catch (error) {
    console.error('❌ Failed to save artisan profile:', error);
    throw error;
  }
}
