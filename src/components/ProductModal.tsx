/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Save, Trash2, Loader2, IndianRupee, Leaf, Info, Package } from 'lucide-react';
import { Product } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export default React.memo(function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    benefit: '',
    category: 'cooking',
    imageUrl: 'https://images.unsplash.com/photo-1590133323218-f22397ee01bc?auto=format&fit=crop&q=80&w=800',
    price: 0,
    size: '',
    usageInstructions: '',
    availability: 'in-stock',
    ecoScore: 95,
    plasticReduced: '',
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        benefit: '',
        category: 'cooking',
        imageUrl: 'https://images.unsplash.com/photo-1590133323218-f22397ee01bc?auto=format&fit=crop&q=80&w=800',
        price: 0,
        size: '',
        usageInstructions: '',
        availability: 'in-stock',
        ecoScore: 95,
        plasticReduced: '',
      });
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const productId = product?.id || `prod-${Date.now()}`;
      const productData = {
        ...formData,
        id: productId,
        artisanId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'products', productId), productData);
      setMessage('Product saved');
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save product:", err);
      setMessage('Error saving product. Check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id || !window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'products', product.id));
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setMessage('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-earth-dark/60 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-8 sm:p-12 overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black text-earth-dark">
                    {product ? 'Edit Product' : 'Add New Craft'}
                  </h2>
                  <p className="text-earth-dark/40 text-sm mt-1">Details will appear on your story cards</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 bg-earth-dark/5 rounded-full hover:bg-earth-dark/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {message && (
                  <div className="mb-4 px-4 py-3 rounded-lg text-sm font-bold" style={{background: message.includes('Error') || message.includes('Failed') ? '#fee2e2' : '#ecfdf5', color: message.includes('Error') || message.includes('Failed') ? '#991b1b' : '#065f46'}}>
                    {message}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Product Name</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-earth-light/30 border-none rounded-3xl py-4 px-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20 text-lg"
                        placeholder="e.g. Traditional Curd Pot"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Category</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as any})}
                        className="w-full bg-earth-light/30 border-none rounded-3xl py-4 px-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20"
                      >
                        <option value="cooking">Cooking</option>
                        <option value="storage">Storage</option>
                        <option value="wellness">Wellness</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Price (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-primary" size={18} />
                        <input 
                          type="number"
                          required
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                          className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-12 pr-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Health/Eco Benefit</label>
                      <textarea 
                        required
                        value={formData.benefit}
                        onChange={e => setFormData({...formData, benefit: e.target.value})}
                        className="w-full bg-earth-light/30 border-none rounded-3xl py-4 px-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20 min-h-[120px]"
                        placeholder="Why is this good for the buyer?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Image URL</label>
                      <div className="relative">
                        <Camera className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-primary" size={18} />
                        <input 
                          value={formData.imageUrl}
                          onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                          className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-12 pr-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20"
                          placeholder="Unsplash image link..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left py-8 border-t border-earth-dark/5">
                   <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Size/Volume</label>
                      <div className="relative">
                        <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-primary" size={18} />
                        <input 
                          value={formData.size}
                          onChange={e => setFormData({...formData, size: e.target.value})}
                          className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-12 pr-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20"
                          placeholder="e.g. 2 Liters"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-earth-dark/40 ml-4">Plastic Reduced (Annual)</label>
                      <div className="relative">
                        <Leaf className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-primary" size={18} />
                        <input 
                          value={formData.plasticReduced}
                          onChange={e => setFormData({...formData, plasticReduced: e.target.value})}
                          className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-12 pr-6 font-bold text-earth-dark focus:ring-2 focus:ring-earth-primary/20"
                          placeholder="e.g. 50 plastic bottles"
                        />
                      </div>
                    </div>
                </div>

                <div className="flex gap-4">
                  {product && (
                    <button 
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="p-6 bg-red-50 text-red-500 rounded-[28px] hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={24} />
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-earth-dark hover:bg-earth-primary text-white py-6 rounded-[28px] font-black text-lg shadow-xl shadow-earth-dark/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save />}
                    {product ? 'Update Legacy Craft' : 'Add to Collection'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
