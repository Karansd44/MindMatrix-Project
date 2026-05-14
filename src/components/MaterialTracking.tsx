/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Edit2,
  History,
  AlertTriangle,
  TrendingDown,
  Package,
  X,
  Check,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { SupplyMaterial } from '../types';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

interface MaterialTrackingProps {
  artisanId: string;
  onClose: () => void;
}

export default function MaterialTracking({
  artisanId,
  onClose,
}: MaterialTrackingProps) {
  const [materials, setMaterials] = useState<SupplyMaterial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<SupplyMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: 0,
    unit: '',
    costPerUnit: 0,
    supplier: '',
    lowStockThreshold: 5,
    reorderPoint: 10,
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'All',
    'Clay',
    'Glaze',
    'Tools',
    'Packaging',
    'Paint',
    'Other',
  ];

  useEffect(() => {
    if (!artisanId) return;

    const q = query(
      collection(db, 'materials'),
      where('artisanId', '==', artisanId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mats: SupplyMaterial[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        mats.push({
          ...data,
          id: doc.id,
          lastPurchased: data.lastPurchased?.toDate?.() || new Date(),
        } as SupplyMaterial);
      });
      setMaterials(mats.sort((a, b) => b.lastPurchased.getTime() - a.lastPurchased.getTime()));
    });

    return () => unsubscribe();
  }, [artisanId]);

  const filteredMaterials = selectedCategory === 'All'
    ? materials
    : materials.filter((m) => m.category === selectedCategory);

  const lowStockMaterials = filteredMaterials.filter(
    (m) => m.currentStock <= m.lowStockThreshold
  );

  const totalInventoryValue = materials.reduce(
    (sum, m) => sum + m.currentStock * m.costPerUnit,
    0
  );

  const handleSaveMaterial = useCallback(async () => {
    if (!formData.name.trim()) {
      alert('Material name is required');
      return;
    }

    setIsSaving(true);
    try {
      const materialId = editingMaterial?.id || doc(collection(db, 'materials')).id;
      await setDoc(doc(db, 'materials', materialId), {
        ...formData,
        artisanId,
        lastPurchased: editingMaterial?.lastPurchased || Timestamp.now(),
        linkedProducts: editingMaterial?.linkedProducts || [],
      });

      setFormData({
        name: '',
        category: '',
        currentStock: 0,
        unit: '',
        costPerUnit: 0,
        supplier: '',
        lowStockThreshold: 5,
        reorderPoint: 10,
      });
      setEditingMaterial(null);
      setShowForm(false);
      setIsSaving(false);
    } catch (err) {
      console.error('Failed to save material:', err);
      alert('Failed to save material');
      setIsSaving(false);
    }
  }, [formData, editingMaterial, artisanId]);

  const handleEditMaterial = useCallback((material: SupplyMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      currentStock: material.currentStock,
      unit: material.unit,
      costPerUnit: material.costPerUnit,
      supplier: material.supplier || '',
      lowStockThreshold: material.lowStockThreshold,
      reorderPoint: material.reorderPoint || 10,
    });
    setShowForm(true);
  }, []);

  const handleDeleteMaterial = useCallback(async (materialId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this material? This cannot be undone.'
      )
    ) {
      try {
        await deleteDoc(doc(db, 'materials', materialId));
      } catch (err) {
        console.error('Failed to delete material:', err);
        alert('Failed to delete material');
      }
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-earth-dark/5 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-earth-dark">Raw Materials</h2>
        <button onClick={onClose} className="p-2 hover:bg-earth-light rounded-full">
          <X size={24} className="text-earth-dark" />
        </button>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-earth-primary/10 to-earth-primary/5 border border-earth-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-earth-dark/60 uppercase">
                Total Inventory Value
              </p>
              <p className="text-2xl font-black text-earth-primary mt-1">
                ₹{totalInventoryValue.toLocaleString()}
              </p>
            </div>
            <Package size={48} className="text-earth-primary/30" />
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <AnimatePresence>
          {lowStockMaterials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-bold text-earth-dark/60 uppercase">
                Low Stock Items
              </p>
              {lowStockMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3"
                >
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-amber-900 truncate">
                      {material.name}
                    </p>
                    <p className="text-xs text-amber-800">
                      {material.currentStock} {material.unit} left
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditMaterial(material)}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                  >
                    Restock
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-earth-primary text-white'
                  : 'bg-earth-light text-earth-dark hover:bg-earth-light/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Material Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-earth-light/50 border border-earth-dark/10 space-y-3"
            >
              <h3 className="text-sm font-bold text-earth-dark">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>

              <input
                type="text"
                placeholder="Material Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
              />

              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Current Stock"
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentStock: parseFloat(e.target.value),
                    })
                  }
                  className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
                />
                <input
                  type="text"
                  placeholder="Unit (kg, meters, etc.)"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Cost Per Unit"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      costPerUnit: parseFloat(e.target.value),
                    })
                  }
                  className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
                />
                <input
                  type="text"
                  placeholder="Supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                  className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Low Stock Threshold"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: parseInt(e.target.value),
                    })
                  }
                  className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
                />
                <input
                  type="number"
                  placeholder="Reorder Point"
                  value={formData.reorderPoint}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderPoint: parseInt(e.target.value),
                    })
                  }
                  className="h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMaterial(null);
                    setFormData({
                      name: '',
                      category: '',
                      currentStock: 0,
                      unit: '',
                      costPerUnit: 0,
                      supplier: '',
                      lowStockThreshold: 5,
                      reorderPoint: 10,
                    });
                  }}
                  className="flex-1 h-12 rounded-xl border-2 border-earth-dark text-earth-dark font-bold hover:bg-earth-light transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMaterial}
                  disabled={isSaving}
                  className="flex-1 h-12 rounded-xl bg-earth-primary text-white font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Material Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full h-12 rounded-xl border-2 border-dashed border-earth-primary text-earth-primary font-bold hover:bg-earth-primary/10 transition-colors active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Material
          </button>
        )}

        {/* Material List */}
        <div className="space-y-3">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-earth-dark/20 mb-3" />
              <p className="text-earth-dark/60 font-semibold">
                No materials added yet
              </p>
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-white border border-earth-dark/5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-earth-dark">{material.name}</p>
                    <p className="text-xs text-earth-dark/60 mt-1">
                      {material.category}
                      {material.supplier && ` • ${material.supplier}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-earth-primary">
                      {material.currentStock} {material.unit}
                    </p>
                    <p className="text-xs text-earth-dark/60 mt-1">
                      ₹{(material.currentStock * material.costPerUnit).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="p-2 rounded-lg bg-earth-light/50">
                    <p className="text-earth-dark/60 font-bold">Cost/Unit</p>
                    <p className="font-black text-earth-dark">
                      ₹{material.costPerUnit}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-earth-light/50">
                    <p className="text-earth-dark/60 font-bold">Low Stock</p>
                    <p className="font-black text-earth-dark">
                      {material.lowStockThreshold}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-earth-light/50">
                    <p className="text-earth-dark/60 font-bold">Items</p>
                    <p className="font-black text-earth-dark">
                      {material.linkedProducts?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMaterial(material)}
                    className="flex-1 h-10 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="w-10 h-10 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors active:scale-95 flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
