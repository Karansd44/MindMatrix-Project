/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Plus, Trash2, Save, Send } from 'lucide-react';
import { ArtisanProduct, Material } from '../types';
import { db } from '../lib/firebase';
import { setDoc, doc, Timestamp, collection } from 'firebase/firestore';

interface ArtisanProductFormProps {
  artisanId: string;
  product?: ArtisanProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ArtisanProductForm({ 
  artisanId, 
  product, 
  onClose, 
  onSuccess 
}: ArtisanProductFormProps) {
  const [formData, setFormData] = useState<Partial<ArtisanProduct>>({
    name: product?.name || '',
    benefit: product?.benefit || '',
    story: product?.story || '',
    category: product?.category || 'cooking',
    price: product?.price || 0,
    compareAtPrice: product?.compareAtPrice,
    currency: product?.currency || 'INR',
    sku: product?.sku || '',
    quantity: product?.quantity || 0,
    lowStockThreshold: product?.lowStockThreshold || 5,
    status: product?.status || 'draft',
    materials: product?.materials || [],
    craftDetails: product?.craftDetails || {
      technique: '',
      timeToMake: 0,
      ecoScore: 85,
      certifications: []
    }
  });

  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, use a placeholder. In production, upload to Firebase Storage
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAddMaterial = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      materials: [...(prev.materials || []), { name: '', category: '', quantityUsed: 0, unit: '', costPerUnit: 0 }]
    }));
  }, []);

  const handleRemoveMaterial = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: (prev.materials || []).filter((_, i) => i !== index)
    }));
  }, []);

  const handleSave = useCallback(async (publishNow: boolean) => {
    if (!formData.name?.trim()) {
      alert('Product name is required');
      return;
    }

    setIsSaving(true);
    try {
      const productId = product?.id || doc(collection(db, 'products')).id;
      await setDoc(doc(db, 'products', productId), {
        ...formData,
        imageUrl: imageUrl || 'https://via.placeholder.com/400',
        artisanId,
        status: publishNow ? 'active' : 'draft',
        createdAt: product?.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now(),
        ecoScore: formData.craftDetails?.ecoScore || 85,
        availability: publishNow ? 'in-stock' : 'on-order',
        size: ''
      });
      
      setTimeout(() => {
        setIsSaving(false);
        onSuccess();
      }, 500);
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product');
      setIsSaving(false);
    }
  }, [formData, imageUrl, artisanId, product, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
    >
      <div className="w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-earth-dark/5 bg-white">
          <h2 className="text-lg font-black text-earth-dark">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-light rounded-full transition-colors"
          >
            <X size={24} className="text-earth-dark" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Image Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-48 rounded-2xl border-2 border-dashed border-earth-dark/20 hover:border-earth-primary/50 transition-colors cursor-pointer flex items-center justify-center bg-earth-light/20 overflow-hidden"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Upload size={32} className="mx-auto text-earth-dark/40 mb-2" />
                <p className="text-sm font-bold text-earth-dark/60">Tap to upload image</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-earth-dark/50">Basic Information</h3>
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 focus:border-transparent outline-none font-semibold"
            />
            <textarea
              placeholder="Product Benefit"
              value={formData.benefit || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, benefit: e.target.value }))}
              className="w-full min-h-24 p-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 focus:border-transparent outline-none font-semibold resize-none"
            />
            <textarea
              placeholder="Craft Story (Cultural/Heritage)"
              value={formData.story || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
              className="w-full min-h-20 p-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 focus:border-transparent outline-none font-semibold resize-none"
            />
          </div>

          {/* Pricing */}
          <div className="space-y-4 pt-6 border-t border-earth-dark/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-earth-dark/50">Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Price"
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
              />
              <input
                type="number"
                placeholder="Compare-at Price (Optional)"
                value={formData.compareAtPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: parseFloat(e.target.value) }))}
                className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-4 pt-6 border-t border-earth-dark/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-earth-dark/50">Inventory</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="SKU"
                value={formData.sku || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
              />
            </div>
            <input
              type="number"
              placeholder="Low Stock Threshold"
              value={formData.lowStockThreshold || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) }))}
              className="w-full h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
            />
          </div>

          {/* Craft Details */}
          <div className="space-y-4 pt-6 border-t border-earth-dark/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-earth-dark/50">Craft Details</h3>
            <input
              type="text"
              placeholder="Craft Technique"
              value={formData.craftDetails?.technique || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                craftDetails: {
                  technique: e.target.value,
                  timeToMake: prev.craftDetails?.timeToMake ?? 0,
                  ecoScore: prev.craftDetails?.ecoScore ?? 85,
                  certifications: prev.craftDetails?.certifications ?? []
                }
              }))}
              className="w-full h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
            />
            <div>
              <label className="text-xs font-bold text-earth-dark/60 block mb-2">Eco Score: {formData.craftDetails?.ecoScore}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.craftDetails?.ecoScore || 5}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  craftDetails: {
                    technique: prev.craftDetails?.technique ?? '',
                    timeToMake: prev.craftDetails?.timeToMake ?? 0,
                    ecoScore: parseInt(e.target.value),
                    certifications: prev.craftDetails?.certifications ?? []
                  }
                }))}
                className="w-full accent-earth-primary"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex gap-3 px-6 py-4 bg-white border-t border-earth-dark/5">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex-1 h-14 rounded-xl border-2 border-earth-dark font-black text-earth-dark hover:bg-earth-light transition-colors active:scale-95 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex-1 h-14 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {isSaving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}