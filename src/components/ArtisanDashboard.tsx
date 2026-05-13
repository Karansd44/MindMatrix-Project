/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  AlertTriangle, 
  X,
  ChevronRight,
  Clock,
  Zap
} from 'lucide-react';
import { Order, ArtisanProduct } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

interface ArtisanDashboardProps {
  artisanId: string;
  artisanName: string;
  village: string;
  onNavigate: (screen: 'add-product' | 'inventory' | 'orders' | 'analytics') => void;
}

export default React.memo(function ArtisanDashboard({ 
  artisanId, 
  artisanName, 
  village,
  onNavigate 
}: ArtisanDashboardProps) {
  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Fetch artisan products
  useEffect(() => {
    const q = query(collection(db, 'products'), where('artisanId', '==', artisanId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: ArtisanProduct[] = [];
      snapshot.forEach((doc) => {
        prods.push({ ...doc.data(), id: doc.id } as ArtisanProduct);
      });
      setProducts(prods);
    });
    return () => unsubscribe();
  }, [artisanId]);

  // Fetch recent orders
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('artisanId', '==', artisanId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersList.push({ 
          ...data, 
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as Order);
      });
      setOrders(ordersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });
    return () => unsubscribe();
  }, [artisanId]);

  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => p.quantity <= (p.lowStockThreshold || 5)).length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    return { activeProducts, lowStockProducts, pendingOrders, totalRevenue };
  }, [products, orders]);

  const lowStockAlerts = useMemo(() => {
    return products.filter(p => p.quantity <= (p.lowStockThreshold || 5) && p.status !== 'archived');
  }, [products]);

  const recentOrders = useMemo(() => {
    return orders.filter(o => ['pending', 'accepted', 'processing'].includes(o.status)).slice(0, 5);
  }, [orders]);

  const handleDismissAlert = useCallback((productId: string) => {
    setDismissedAlerts(prev => new Set([...prev, productId]));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto pb-32 px-6 py-6">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-black text-earth-dark">{artisanName}</h1>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-earth-light/50">
          <span className="text-xs font-bold text-earth-primary uppercase tracking-wide">{village}</span>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          <div className="min-w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
            <span className="text-xl font-black text-blue-600">{stats.activeProducts}</span>
            <span className="text-xs font-bold text-blue-600">Active</span>
          </div>
          <div className="min-w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
            <span className="text-xl font-black text-amber-600">{stats.pendingOrders}</span>
            <span className="text-xs font-bold text-amber-600">Pending</span>
          </div>
          <div className="min-w-fit flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
            <span className="text-lg font-black text-green-600">₹{(stats.totalRevenue / 1000).toFixed(1)}K</span>
            <span className="text-xs font-bold text-green-600">Revenue</span>
          </div>
        </div>
      </motion.div>

      {/* Action Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <button
          onClick={() => onNavigate('add-product')}
          className="group p-4 rounded-2xl bg-earth-primary text-white font-black text-sm flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-all active:scale-95"
        >
          <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
          <span>Add Product</span>
        </button>
        
        <button
          onClick={() => onNavigate('inventory')}
          className="group p-4 rounded-2xl bg-earth-secondary text-white font-black text-sm flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-all active:scale-95"
        >
          <Package size={32} className="mb-2 group-hover:scale-110 transition-transform" />
          <span>Inventory</span>
        </button>
        
        <button
          onClick={() => onNavigate('orders')}
          className="group p-4 rounded-2xl bg-earth-dark text-white font-black text-sm flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-all active:scale-95"
        >
          <ShoppingCart size={32} className="mb-2 group-hover:scale-110 transition-transform" />
          <span>Orders</span>
        </button>
        
        <button
          onClick={() => onNavigate('analytics')}
          className="group p-4 rounded-2xl bg-earth-bg border-2 border-earth-dark text-earth-dark font-black text-sm flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-all active:scale-95"
        >
          <BarChart3 size={32} className="mb-2 group-hover:scale-110 transition-transform" />
          <span>Analytics</span>
        </button>
      </motion.div>

      {/* Low Stock Alerts */}
      <AnimatePresence>
        {lowStockAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 space-y-3"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-earth-dark/50">Low Stock Alerts</h3>
            {lowStockAlerts.map((product) => {
              if (dismissedAlerts.has(product.id)) return null;
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative p-4 rounded-xl bg-amber-50 border border-amber-200"
                >
                  <div className="flex gap-3">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-black text-sm text-amber-900">{product.name}</p>
                      <p className="text-xs text-amber-800 mt-1">
                        Only {product.quantity} {product.quantity === 1 ? 'unit' : 'units'} left
                      </p>
                      <button className="mt-3 text-xs font-black text-amber-600 hover:text-amber-700">
                        Quick Restock →
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(product.id)}
                    className="absolute top-2 right-2 p-2 hover:bg-amber-200/50 rounded-full transition-colors"
                  >
                    <X size={16} className="text-amber-600" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-earth-dark/50 mb-3">Active Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-white border border-earth-dark/5 hover:shadow-md transition-all active:scale-95"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-black text-sm text-earth-dark truncate">{order.productName}</p>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{
                        backgroundColor: order.status === 'pending' ? '#FEF3C7' : order.status === 'accepted' ? '#DBEAFE' : '#D1FAE5',
                        color: order.status === 'pending' ? '#92400E' : order.status === 'accepted' ? '#1E40AF' : '#065F46'
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-earth-dark/60">{order.customerName} · Qty: {order.quantity}</p>
                    <p className="text-sm font-black text-earth-primary mt-2">₹{order.totalPrice}</p>
                  </div>
                  <ChevronRight size={20} className="text-earth-dark/30 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {products.length === 0 && orders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Zap size={48} className="text-earth-dark/20 mb-3" />
          <p className="text-sm font-bold text-earth-dark/50">Welcome to your craft business dashboard!</p>
          <p className="text-xs text-earth-dark/40 mt-1 max-w-xs">Add your first product to get started.</p>
        </motion.div>
      )}
    </div>
  );
});