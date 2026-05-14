import { db } from '../lib/firebase';
import { ArtisanProduct } from '../types';
import { collection, doc, setDoc, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Save or create an ArtisanProduct in `products` collection.
 * If `product.id` is provided it will overwrite/merge that doc.
 * Otherwise it will create a new document and return its id.
 */
export async function saveProduct(product: Partial<ArtisanProduct>) {
  try {
    const now = Timestamp.now();
    if (product.id) {
      const ref = doc(db, 'products', product.id);
      await setDoc(ref, { ...product, updatedAt: now }, { merge: true });
      return { ok: true, id: product.id };
    }

    const col = collection(db, 'products');
    const ref = await addDoc(col, { ...product, createdAt: now, updatedAt: now });
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error('Failed to save product', err);
    throw err;
  }
}

export async function saveProductsBulk(products: Partial<ArtisanProduct>[]) {
  const results: Array<{ ok: boolean; id?: string; error?: any }> = [];
  for (const p of products) {
    try {
      const res = await saveProduct(p);
      results.push(res as any);
    } catch (err) {
      results.push({ ok: false, error: err });
    }
  }
  return results;
}
