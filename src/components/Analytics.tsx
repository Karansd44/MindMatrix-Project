/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { Order, ArtisanProduct } from '../types';

interface AnalyticsProps {
  products: ArtisanProduct[];
  orders: Order[];
  onClose: () => void;
}

export default React.memo(function Analytics({ 
  products, 
  orders, 
  onClose 
}: AnalyticsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const ordersCount = deliveredOrders.length;
    const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    // Find top product
    const productSales = new Map<string, number>();
    deliveredOrders.forEach(o => {
      productSales.set(o.productId, (productSales.get(o.productId) || 0) + o.quantity);
    });
    
    const topProductId = Array.from(productSales.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topProduct = products.find(p => p.id === topProductId);

    const activeProducts = products.filter(p => p.status === 'active').length;
    const conversionRate = products.length > 0 ? (ordersCount / products.length) * 100 : 0;

    return {
      totalRevenue,
      ordersCount,
      averageOrderValue,
      topProduct,
      activeProducts,
      conversionRate
    };
  }, [orders, products]);

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
          <h2 className="text-lg font-black text-earth-dark">Analytics</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-light rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 px-6 py-4 bg-earth-light/30 rounded-full h-12 mx-6 mt-4 mb-4 items-center justify-center">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 h-8 rounded-full font-bold text-xs transition-all ${
                period === p
                  ? 'bg-white text-earth-primary shadow-sm'
                  : 'text-earth-dark/60'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-earth-primary to-earth-dark text-white"
          >
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Revenue</p>
            <p className="text-4xl font-black mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp size={16} />
              <span>vs last {period}</span>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-xl bg-blue-50 border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={18} className="text-blue-600" />
                <p className="text-xs font-bold text-blue-600 uppercase">Orders</p>
              </div>
              <p className="text-2xl font-black text-blue-600">{stats.ordersCount}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-xl bg-green-50 border border-green-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-green-600" />
                <p className="text-xs font-bold text-green-600 uppercase">Avg Order</p>
              </div>
              <p className="text-2xl font-black text-green-600">₹{Math.round(stats.averageOrderValue)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 rounded-xl bg-purple-50 border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Package size={18} className="text-purple-600" />
                <p className="text-xs font-bold text-purple-600 uppercase">Active Prod</p>
              </div>
              <p className="text-2xl font-black text-purple-600">{stats.activeProducts}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 rounded-xl bg-amber-50 border border-amber-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-amber-600" />
                <p className="text-xs font-bold text-amber-600 uppercase">Conversion</p>
              </div>
              <p className="text-2xl font-black text-amber-600">{stats.conversionRate.toFixed(1)}%</p>
            </motion.div>
          </div>

          {/* Top Product */}
          {stats.topProduct && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-2xl bg-white border border-earth-dark/5"
            >
              <p className="text-xs font-bold text-earth-dark/60 uppercase tracking-widest mb-3">Top Product</p>
              <div className="flex gap-3">
                <img
                  src={stats.topProduct.imageUrl}
                  alt={stats.topProduct.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-black text-earth-dark">{stats.topProduct.name}</p>
                  <p className="text-xs text-earth-dark/60 mt-1">{stats.topProduct.price} Each</p>
                  <p className="text-sm font-bold text-earth-primary mt-2">★ Best Seller</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Export Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full h-12 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg transition-all active:scale-95"
          >
            Export Report
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});