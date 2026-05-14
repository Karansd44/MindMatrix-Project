/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { CustomRequest, CustomRequestStatus } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, query, where, Timestamp } from 'firebase/firestore';

interface CustomRequestsHandlerProps {
  artisanId: string;
  onClose: () => void;
}

const STATUS_COLORS: Record<CustomRequestStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pending Response' },
  rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejected' },
  counter_offered: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Counter Offer' },
  accepted: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Accepted' },
  completed: { bg: 'bg-green-50', text: 'text-green-600', label: 'Completed' },
};

interface CounterOfferData {
  requestId: string;
  proposedPrice: number;
  proposedTimeline: string;
  notes: string;
}

export default React.memo(function CustomRequestsHandler({ artisanId, onClose }: CustomRequestsHandlerProps) {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [activeTab, setActiveTab] = useState<CustomRequestStatus>('pending');
  const [counterOfferingId, setCounterOfferingId] = useState<string | null>(null);
  const [counterOfferData, setCounterOfferData] = useState<CounterOfferData>({
    requestId: '',
    proposedPrice: 0,
    proposedTimeline: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Subscribe to custom requests
  useEffect(() => {
    const q = query(collection(db, 'customRequests'), where('artisanId', '==', artisanId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as CustomRequest[];
      setRequests(requestsData.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()));
    });
    return unsubscribe;
  }, [artisanId]);

  const tabs: { label: string; status: CustomRequestStatus }[] = [
    { label: 'Pending', status: 'pending' },
    { label: 'Counter Offers', status: 'counter_offered' },
    { label: 'Accepted', status: 'accepted' },
    { label: 'Completed', status: 'completed' },
  ];

  const filteredRequests = requests.filter(r => r.status === activeTab);

  const handleSendCounterOffer = useCallback(async () => {
    if (!counterOfferData.proposedPrice || !counterOfferData.proposedTimeline.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'customRequests', counterOfferData.requestId),
        {
          status: 'counter_offered',
          artisanCounterOffer: {
            proposedPrice: counterOfferData.proposedPrice,
            proposedTimeline: counterOfferData.proposedTimeline,
            notes: counterOfferData.notes,
          },
          respondedAt: Timestamp.now(),
        },
        { merge: true }
      );

      setCounterOfferingId(null);
      setCounterOfferData({
        requestId: '',
        proposedPrice: 0,
        proposedTimeline: '',
        notes: '',
      });
    } catch (err) {
      console.error('Failed to send counter offer:', err);
      alert('Failed to send counter offer');
    } finally {
      setIsSaving(false);
    }
  }, [counterOfferData]);

  const handleRejectRequest = useCallback(async (requestId: string) => {
    if (!confirm('Reject this request?')) return;

    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'customRequests', requestId),
        {
          status: 'rejected',
          respondedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to reject request:', err);
      alert('Failed to reject request');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleAcceptCounterOffer = useCallback(async (requestId: string) => {
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'customRequests', requestId),
        {
          status: 'accepted',
          respondedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to accept counter offer:', err);
      alert('Failed to accept counter offer');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleMessageCustomer = useCallback((request: CustomRequest) => {
    const message = `Hi ${request.customerName}, regarding your custom request...`;
    window.open(`https://wa.me/${request.customerPhone}?text=${encodeURIComponent(message)}`);
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
          <h2 className="text-lg font-black text-earth-dark">Custom Requests</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth-light rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-4 bg-earth-light/30 overflow-x-auto">
          {tabs.map((tab) => {
            const count = requests.filter(r => r.status === tab.status).length;
            return (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={`px-4 py-2 rounded-full font-black text-xs whitespace-nowrap transition-all ${
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

        {/* Request List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence mode="wait">
            {filteredRequests.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <DollarSign size={48} className="text-earth-dark/20 mb-3" />
                <p className="text-sm font-bold text-earth-dark/50">No requests in this status</p>
              </motion.div>
            ) : (
              filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-5 rounded-2xl bg-white border border-earth-dark/5 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-black text-earth-dark">{request.customerName}</p>
                      <p className="text-xs text-earth-dark/50">
                        {request.createdAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${STATUS_COLORS[request.status].bg} ${STATUS_COLORS[request.status].text}`}>
                      {STATUS_COLORS[request.status].label}
                    </span>
                  </div>

                  {/* Customer Contact */}
                  <div className="mb-3 pb-3 border-b border-earth-dark/5">
                    <p className="text-xs text-earth-dark/60 font-bold mb-1">CUSTOMER CONTACT</p>
                    <p className="text-sm text-earth-dark/70">{request.customerPhone}</p>
                    {request.customerEmail && (
                      <p className="text-sm text-earth-dark/70">{request.customerEmail}</p>
                    )}
                  </div>

                  {/* Request Details */}
                  <div className="mb-3 pb-3 border-b border-earth-dark/5">
                    <p className="text-xs text-earth-dark/60 font-bold mb-1">REQUEST</p>
                    <p className="text-sm text-earth-dark/80">{request.description}</p>
                    {request.requestedFeatures && request.requestedFeatures.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {request.requestedFeatures.map((feature, idx) => (
                          <span key={idx} className="text-xs bg-earth-light px-2 py-1 rounded-lg text-earth-dark">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Budget & Timeline */}
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    {request.budget && (
                      <div className="p-3 bg-earth-light/50 rounded-xl">
                        <p className="text-xs text-earth-dark/60 font-bold mb-1">BUDGET</p>
                        <p className="text-sm font-bold text-earth-primary">₹{request.budget}</p>
                      </div>
                    )}
                    {request.timeline && (
                      <div className="p-3 bg-earth-light/50 rounded-xl">
                        <p className="text-xs text-earth-dark/60 font-bold mb-1">TIMELINE</p>
                        <p className="text-sm font-bold text-earth-dark">{request.timeline}</p>
                      </div>
                    )}
                  </div>

                  {/* Counter Offer Display */}
                  {request.artisanCounterOffer && (
                    <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-600 font-bold mb-2">YOUR COUNTER OFFER</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-purple-600 font-bold">Price</p>
                          <p className="text-sm font-bold text-purple-900">₹{request.artisanCounterOffer.proposedPrice}</p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-bold">Timeline</p>
                          <p className="text-sm font-bold text-purple-900">{request.artisanCounterOffer.proposedTimeline}</p>
                        </div>
                      </div>
                      {request.artisanCounterOffer.notes && (
                        <p className="text-sm text-purple-800">{request.artisanCounterOffer.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {request.status === 'pending' && (
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={isSaving}
                          className="h-12 rounded-xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 disabled:opacity-50 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                        <button
                          onClick={() => handleMessageCustomer(request)}
                          className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setCounterOfferingId(request.id);
                            setCounterOfferData({
                              requestId: request.id,
                              proposedPrice: request.budget || 0,
                              proposedTimeline: request.timeline || '',
                              notes: '',
                            });
                          }}
                          className="h-12 rounded-xl bg-purple-50 text-purple-600 font-black text-sm hover:bg-purple-100 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <DollarSign size={16} />
                          Counter
                        </button>
                      </div>
                    )}

                    {request.status === 'counter_offered' && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleMessageCustomer(request)}
                          className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                          Message
                        </button>
                        <button
                          onClick={() => {
                            setCounterOfferingId(request.id);
                            setCounterOfferData({
                              requestId: request.id,
                              proposedPrice: request.artisanCounterOffer?.proposedPrice || 0,
                              proposedTimeline: request.artisanCounterOffer?.proposedTimeline || '',
                              notes: request.artisanCounterOffer?.notes || '',
                            });
                          }}
                          className="h-12 rounded-xl bg-purple-50 text-purple-600 font-black text-sm hover:bg-purple-100 transition-colors active:scale-95 flex items-center justify-center gap-2"
                        >
                          <DollarSign size={16} />
                          Edit
                        </button>
                      </div>
                    )}

                    {request.status === 'accepted' && (
                      <button
                        onClick={() => handleMessageCustomer(request)}
                        className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Message Customer
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Counter Offer Modal */}
      <AnimatePresence>
        {counterOfferingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl"
            >
              <h3 className="text-lg font-black text-earth-dark mb-4">Send Counter Offer</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black text-earth-dark/60 mb-2 block">PROPOSED PRICE (₹)</label>
                  <input
                    type="number"
                    value={counterOfferData.proposedPrice}
                    onChange={(e) => setCounterOfferData({ ...counterOfferData, proposedPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-earth-dark/60 mb-2 block">PROPOSED TIMELINE</label>
                  <input
                    type="text"
                    value={counterOfferData.proposedTimeline}
                    onChange={(e) => setCounterOfferData({ ...counterOfferData, proposedTimeline: e.target.value })}
                    placeholder="e.g., 2-3 weeks"
                    className="w-full px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-earth-dark/60 mb-2 block">NOTES</label>
                  <textarea
                    value={counterOfferData.notes}
                    onChange={(e) => setCounterOfferData({ ...counterOfferData, notes: e.target.value })}
                    placeholder="Add any additional notes for the customer..."
                    className="w-full min-h-20 px-4 py-3 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCounterOfferingId(null)}
                  disabled={isSaving}
                  className="flex-1 h-12 rounded-xl bg-earth-light text-earth-dark font-black disabled:opacity-50 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCounterOffer}
                  disabled={isSaving || !counterOfferData.proposedPrice || !counterOfferData.proposedTimeline.trim()}
                  className="flex-1 h-12 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSaving ? 'Sending...' : 'Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
