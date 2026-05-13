/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Search, Filter, Edit2, MoreVertical, AlertTriangle, Package } from 'lucide-react';
import { ArtisanProduct } from '../types';

interface InventoryManagementProps {
  products: ArtisanProduct[];
  onClose: () => void;
  onEditProduct: (product: ArtisanProduct) => void;
}

export default React.memo(function InventoryManagement({ 
  products, 
  onClose, 
  onEditProduct 
}: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price'>('name');

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(p => p.quantity <= (p.lowStockThreshold || 5)).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    
    return { total, lowStock, outOfStock };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'quantity') return b.quantity - a.quantity;
        if (sortBy === 'price') return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, searchQuery, sortBy]);

  const getStockBadgeColor = (product: ArtisanProduct) => {
    if (product.quantity === 0) return 'bg-red-50 text-red-600 border-red-200';
    if (product.quantity <= (product.lowStockThreshold || 5)) return 'bg-amber-50 text-amber-600 border-amber-200';
    return 'bg-green-50 text-green-600 border-green-200';
  };

  const getStockIcon = (product: ArtisanProduct) => {
    if (product.quantity === 0) return '⚠️';
    if (product.quantity <= (product.lowStockThreshold || 5)) return '⏱️';
    return '✓';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
    >
      <div className="w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-earth-dark/5">
          <h2 className="text-lg font-black text-earth-dark">Inventory</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-light rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 px-6 py-4 border-b border-earth-dark/5">
          <div className="flex-1 flex items-center gap-2 px-4 h-12 rounded-xl border border-earth-dark/10 bg-white">
            <Search size={18} className="text-earth-dark/40" />
            <input
              type="text"
              placeholder="Search by name or SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-semibold"
            />
          </div>
          <button className="w-12 h-12 rounded-xl border border-earth-dark/10 flex items-center justify-center hover:bg-earth-light transition-colors">
            <Filter size={18} className="text-earth-dark" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3 px-6 py-4 overflow-x-auto">
          <div className="min-w-fit flex-1 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-black text-blue-600">{stats.total}</p>
          </div>
          <div className="min-w-fit flex-1 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Low Stock</p>
            <p className="text-2xl font-black text-amber-600">{stats.lowStock}</p>
          </div>
          <div className="min-w-fit flex-1 p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Out</p>
            <p className="text-2xl font-black text-red-600">{stats.outOfStock}</p>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package size={48} className="text-earth-dark/20 mb-3" />
              <p className="text-sm font-bold text-earth-dark/50">No products found</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 h-20 px-4 rounded-xl bg-white border border-earth-dark/5 hover:shadow-md transition-all active:scale-95"
              >
                {/* Image Thumbnail */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-earth-dark truncate">{product.name}</p>
                  <p className="text-xs text-earth-dark/60">SKU: {product.sku}</p>
                </div>

                {/* Stock Badge */}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold ${getStockBadgeColor(product)}`}>
                  <span>{getStockIcon(product)}</span>
                  <span>{product.quantity}</span>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => onEditProduct(product)}
                  className="w-10 h-10 rounded-full hover:bg-earth-light transition-colors flex items-center justify-center"
                >
                  <Edit2 size={18} className="text-earth-dark" />
                </button>
                <button className="w-10 h-10 rounded-full hover:bg-earth-light transition-colors flex items-center justify-center">
                  <MoreVertical size={18} className="text-earth-dark" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
});