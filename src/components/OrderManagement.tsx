/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Package, CheckCircle2, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderManagementProps {
  orders: Order[];
  onClose: () => void;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pending' },
  accepted: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Accepted' },
  processing: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Processing' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Shipped' },
  delivered: { bg: 'bg-green-50', text: 'text-green-600', label: 'Delivered' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelled' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
};

export default React.memo(function OrderManagement({ orders, onClose }: OrderManagementProps) {
  const [activeTab, setActiveTab] = useState<OrderStatus>('pending');

  const tabs: { label: string; status: OrderStatus }[] = [
    { label: 'New', status: 'pending' },
    { label: 'Processing', status: 'processing' },
    { label: 'Shipped', status: 'shipped' },
    { label: 'Completed', status: 'delivered' },
  ];

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => o.status === activeTab)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders, activeTab]);

  const handleAcceptOrder = useCallback((orderId: string) => {
    console.log('Accept order:', orderId);
    // Update order status in Firestore
  }, []);

  const handleRejectOrder = useCallback((orderId: string) => {
    console.log('Reject order:', orderId);
    // Update order status in Firestore
  }, []);

  const handleMessageBuyer = useCallback((order: Order) => {
    const message = `Hi ${order.customerName}, regarding your order for ${order.productName}...`;
    window.open(`https://wa.me/${order.customerPhone}?text=${encodeURIComponent(message)}`);
  }, []);

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
          <h2 className="text-lg font-black text-earth-dark">Orders</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-light rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 px-6 py-4 bg-earth-light/30 rounded-full h-14 mx-6 mt-4 mb-4 items-center">
          {tabs.map((tab) => {
            const count = orders.filter(o => o.status === tab.status).length;
            return (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={`flex-1 h-10 rounded-full font-black text-xs transition-all ${
                  activeTab === tab.status
                    ? 'bg-white text-earth-primary shadow-sm'
                    : 'text-earth-dark/60 hover:text-earth-dark'
                }`}
              >
                {tab.label}
                {count > 0 && <span className="ml-1 badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Order List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Package size={48} className="text-earth-dark/20 mb-3" />
                <p className="text-sm font-bold text-earth-dark/50">No orders in this status</p>
              </motion.div>
            ) : (
              filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-5 rounded-2xl bg-white border border-earth-dark/5 hover:shadow-md transition-all"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs text-earth-dark/60 font-bold">Order #{order.id.slice(-8)}</p>
                      <p className="text-xs text-earth-dark/50">
                        {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${STATUS_COLORS[order.status].bg} ${STATUS_COLORS[order.status].text}`}>
                      {STATUS_COLORS[order.status].label}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex gap-3 mb-3 pb-3 border-b border-earth-dark/5">
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-earth-dark truncate">{order.productName}</p>
                      <p className="text-xs text-earth-dark/60">Qty: {order.quantity}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3 pb-3 border-b border-earth-dark/5">
                    <p className="text-xs text-earth-dark/60 font-bold mb-1">CUSTOMER</p>
                    <p className="text-sm font-bold text-earth-dark">{order.customerName}</p>
                    <p className="text-xs text-earth-dark/60">{order.customerPhone}</p>
                  </div>

                  {/* Total Price */}
                  <div className="mb-4">
                    <p className="text-lg font-black text-earth-primary">
                      ₹{order.totalPrice}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="h-12 rounded-xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleMessageBuyer(order)}
                          className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="h-12 rounded-xl bg-earth-primary text-white font-black text-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          Accept
                        </button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <>
                        <button
                          onClick={() => handleMessageBuyer(order)}
                          className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 col-span-3 flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                          Message Buyer
                        </button>
                      </>
                    )}
                    {['shipped', 'delivered'].includes(order.status) && (
                      <button
                        onClick={() => handleMessageBuyer(order)}
                        className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 col-span-3 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Message Buyer
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});