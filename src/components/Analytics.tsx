/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Package, ShoppingCart, DollarSign, Download, Calendar, Users } from 'lucide-react';
import { Order, ArtisanProduct } from '../types';

interface AnalyticsProps {
  products: ArtisanProduct[];
  orders: Order[];
  onClose: () => void;
}

interface PeriodStats {
  totalRevenue: number;
  ordersCount: number;
  percentageChange: number;
}

export default React.memo(function Analytics({ 
  products, 
  orders, 
  onClose 
}: AnalyticsProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'customers'>('overview');

  const getPeriodStats = (p: 'week' | 'month' | 'year'): PeriodStats => {
    const now = new Date();
    let startDate = new Date();

    if (p === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (p === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const periodOrders = orders.filter(o => 
      o.status === 'delivered' && 
      o.updatedAt && 
      o.updatedAt.toDate() >= startDate
    );

    const totalRevenue = periodOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const ordersCount = periodOrders.length;

    // Calculate percentage change vs previous period
    let prevStartDate = new Date(startDate);
    if (p === 'week') {
      prevStartDate.setDate(startDate.getDate() - 7);
    } else if (p === 'month') {
      prevStartDate.setMonth(startDate.getMonth() - 1);
    } else {
      prevStartDate.setFullYear(startDate.getFullYear() - 1);
    }

    const prevOrders = orders.filter(o =>
      o.status === 'delivered' &&
      o.updatedAt &&
      o.updatedAt.toDate() >= prevStartDate &&
      o.updatedAt.toDate() < startDate
    );

    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const percentageChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return { totalRevenue, ordersCount, percentageChange };
  };

  const stats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const ordersCount = deliveredOrders.length;
    const averageOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

    // Find top products
    const productSales = new Map<string, { count: number; revenue: number }>();
    deliveredOrders.forEach(o => {
      const existing = productSales.get(o.productId) || { count: 0, revenue: 0 };
      productSales.set(o.productId, {
        count: existing.count + o.quantity,
        revenue: existing.revenue + o.totalPrice,
      });
    });
    
    const topProductId = Array.from(productSales.entries()).sort((a, b) => b[1].revenue - a[1].revenue)[0]?.[0];
    const topProduct = products.find(p => p.id === topProductId);
    const topProducts = Array.from(productSales.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    // Find top customers
    const customerOrders = new Map<string, { name: string; count: number; revenue: number }>();
    deliveredOrders.forEach(o => {
      const existing = customerOrders.get(o.customerId) || { name: o.customerName, count: 0, revenue: 0 };
      customerOrders.set(o.customerId, {
        name: o.customerName,
        count: existing.count + 1,
        revenue: existing.revenue + o.totalPrice,
      });
    });

    const topCustomers = Array.from(customerOrders.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const activeProducts = products.filter(p => p.status === 'active').length;
    const conversionRate = products.length > 0 ? (ordersCount / products.length) * 100 : 0;
    const repeatCustomerRate = customerOrders.size > 0 
      ? (Array.from(customerOrders.values()).filter(c => c.count > 1).length / customerOrders.size) * 100 
      : 0;

    const periodStats = getPeriodStats(period);

    return {
      totalRevenue,
      ordersCount,
      averageOrderValue,
      topProduct,
      topProducts,
      topCustomers,
      activeProducts,
      conversionRate,
      repeatCustomerRate,
      ...periodStats,
    };
  }, [orders, products, period]);

  const handleExportPDF = useCallback(() => {
    // Create CSV data
    const csvData = [
      ['Analytics Report', new Date().toLocaleDateString()],
      [],
      ['OVERVIEW'],
      ['Total Revenue', `₹${stats.totalRevenue}`],
      ['Orders', stats.ordersCount],
      ['Average Order Value', `₹${Math.round(stats.averageOrderValue)}`],
      ['Conversion Rate', `${stats.conversionRate.toFixed(1)}%`],
      ['Repeat Customer Rate', `${stats.repeatCustomerRate.toFixed(1)}%`],
      [],
      ['TOP PRODUCTS'],
      ...stats.topProducts.map(p => [`Product ${p.id}`, `₹${p.revenue}`, `${p.count} sold`]),
      [],
      ['TOP CUSTOMERS'],
      ...stats.topCustomers.map(c => [c.name, `${c.count} orders`, `₹${c.revenue}`]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [stats]);

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

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 bg-earth-light/20 border-b border-earth-dark/5">
          {(['overview', 'products', 'customers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${
                selectedTab === tab
                  ? 'bg-earth-primary text-white'
                  : 'text-earth-dark/60 hover:text-earth-dark'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence mode="wait">
            {selectedTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Revenue Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-earth-primary to-earth-dark text-white"
                >
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Revenue ({period})</p>
                  <p className="text-4xl font-black mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <TrendingUp size={16} />
                    <span className={stats.percentageChange >= 0 ? 'text-green-200' : 'text-red-200'}>
                      {stats.percentageChange >= 0 ? '+' : ''}{stats.percentageChange.toFixed(1)}% vs prev {period}
                    </span>
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

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-5 rounded-xl bg-indigo-50 border border-indigo-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={18} className="text-indigo-600" />
                      <p className="text-xs font-bold text-indigo-600 uppercase">Repeat Rate</p>
                    </div>
                    <p className="text-2xl font-black text-indigo-600">{stats.repeatCustomerRate.toFixed(1)}%</p>
                  </motion.div>
                </div>

                {/* Top Product */}
                {stats.topProduct && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
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
                        <p className="text-xs text-earth-dark/60 mt-1">₹{stats.topProduct.price} each</p>
                        <p className="text-sm font-bold text-earth-primary mt-2">⭐ Best Seller</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {selectedTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-xs font-black text-earth-dark/60 uppercase">Top Performing Products</p>
                {stats.topProducts.map((prod, idx) => {
                  const product = products.find(p => p.id === prod.id);
                  return (
                    <motion.div
                      key={prod.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl border border-earth-dark/5 bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-earth-dark">{product?.name || 'Unknown'}</p>
                          <p className="text-xs text-earth-dark/60 mt-1">{prod.count} units sold</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-earth-primary">₹{prod.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {selectedTab === 'customers' && (
              <motion.div
                key="customers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-xs font-black text-earth-dark/60 uppercase">Top Customers</p>
                {stats.topCustomers.map((customer, idx) => (
                  <motion.div
                    key={customer.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl border border-earth-dark/5 bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-earth-dark">{customer.name}</p>
                        <p className="text-xs text-earth-dark/60 mt-1">{customer.count} {customer.count === 1 ? 'order' : 'orders'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-earth-primary">₹{customer.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={handleExportPDF}
            className="w-full h-12 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-6"
          >
            <Download size={18} />
            Export Report
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});