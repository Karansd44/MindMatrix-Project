/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Calculator, X, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { ArtisanProduct, PricingSuggestion, CostBreakdown } from '../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface PricingCalculatorProps {
  artisanId: string;
  onClose: () => void;
}

export default function PricingCalculator({
  artisanId,
  onClose,
}: PricingCalculatorProps) {
  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ArtisanProduct | null>(null);
  const [hourlyRate, setHourlyRate] = useState(200); // Default ₹200/hour
  const [overheadPercent, setOverheadPercent] = useState(15); // 15% overhead

  useEffect(() => {
    if (!artisanId) return;

    const q = query(
      collection(db, 'products'),
      where('artisanId', '==', artisanId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: ArtisanProduct[] = [];
      snapshot.forEach((doc) => {
        prods.push({ ...doc.data(), id: doc.id } as ArtisanProduct);
      });
      setProducts(prods);
      if (prods.length > 0 && !selectedProduct) {
        setSelectedProduct(prods[0]);
      }
    });

    return () => unsubscribe();
  }, [artisanId, selectedProduct]);

  const calculateCostBreakdown = useCallback((): CostBreakdown | null => {
    if (!selectedProduct) return null;

    // Calculate materials cost
    const materialsCost = selectedProduct.materials?.reduce((sum, m) => {
      return sum + m.quantityUsed * m.costPerUnit;
    }, 0) || 0;

    // Calculate labor cost
    const timeToMake = selectedProduct.craftDetails?.timeToMake || 2;
    const laborCost = timeToMake * hourlyRate;

    // Calculate overhead (% of materials + labor)
    const subtotal = materialsCost + laborCost;
    const overhead = (subtotal * overheadPercent) / 100;

    const totalCost = materialsCost + laborCost + overhead;

    return {
      materialsCost: Math.round(materialsCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      overhead: Math.round(overhead * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }, [selectedProduct, hourlyRate, overheadPercent]);

  const pricing = useMemo((): PricingSuggestion | null => {
    if (!selectedProduct) return null;

    const costBreakdown = calculateCostBreakdown();
    if (!costBreakdown) return null;

    const cost = costBreakdown.totalCost;

    return {
      productId: selectedProduct.id,
      costBreakdown,
      suggestedWholesale: Math.round(cost * 1.3 * 100) / 100,  // +30%
      suggestedRetail: Math.round(cost * 1.6 * 100) / 100,     // +60%
      suggestedMarketplace: Math.round(cost * 1.5 * 100) / 100, // +50%
      currentPrice: selectedProduct.price,
      potentialMargin: Math.round((selectedProduct.price - cost) * 100) / 100,
      marginPercentage: Math.round(
        ((selectedProduct.price - cost) / selectedProduct.price) * 100
      ),
    };
  }, [selectedProduct, calculateCostBreakdown]);

  const costBreakdown = calculateCostBreakdown();

  const getMarginStatus = (margin: number) => {
    if (margin < 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Loss' };
    if (margin < 20) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Low' };
    if (margin < 40) return { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Fair' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good' };
  };

  const marginStatus = pricing ? getMarginStatus(pricing.marginPercentage) : null;

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-earth-dark/5 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-earth-dark">Pricing Calculator</h2>
        <button onClick={onClose} className="p-2 hover:bg-earth-light rounded-full">
          <X size={24} className="text-earth-dark" />
        </button>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Product Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-xs font-bold text-earth-dark/60 uppercase">
            Select Product
          </label>
          <select
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const prod = products.find((p) => p.id === e.target.value);
              setSelectedProduct(prod || null);
            }}
            className="w-full h-12 px-4 rounded-xl border border-earth-dark/10 focus:ring-2 focus:ring-earth-primary/20 outline-none font-semibold bg-white"
          >
            <option value="">Choose a product...</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
        </motion.div>

        {selectedProduct ? (
          <>
            {/* Cost Input Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl bg-earth-light/50 border border-earth-dark/10 space-y-4"
            >
              <h3 className="text-sm font-bold text-earth-dark">Cost Parameters</h3>

              <div>
                <label className="text-xs font-bold text-earth-dark/60 uppercase block mb-2">
                  Hourly Labor Rate: ₹{hourlyRate}/hour
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="w-full accent-earth-primary"
                />
                <p className="text-xs text-earth-dark/60 mt-2">
                  Time to Make: {selectedProduct.craftDetails?.timeToMake || 2} hours
                </p>
              </div>

              <div className="border-t border-earth-dark/10 pt-4">
                <label className="text-xs font-bold text-earth-dark/60 uppercase block mb-2">
                  Overhead %: {overheadPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={overheadPercent}
                  onChange={(e) => setOverheadPercent(parseInt(e.target.value))}
                  className="w-full accent-earth-primary"
                />
                <p className="text-xs text-earth-dark/60 mt-2">
                  Covers rent, utilities, packaging, shipping
                </p>
              </div>
            </motion.div>

            {/* Cost Breakdown */}
            {costBreakdown && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold text-earth-dark/60 uppercase">
                  Cost Breakdown
                </h3>

                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-900">
                      Materials Cost
                    </span>
                    <span className="text-xl font-black text-blue-600">
                      ₹{costBreakdown.materialsCost}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    {selectedProduct.materials?.length || 0} materials used
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-900">
                      Labor Cost
                    </span>
                    <span className="text-xl font-black text-green-600">
                      ₹{costBreakdown.laborCost}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    {selectedProduct.craftDetails?.timeToMake || 2} hours ×
                    ₹{hourlyRate}/hour
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-purple-900">
                      Overhead
                    </span>
                    <span className="text-xl font-black text-purple-600">
                      ₹{costBreakdown.overhead}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-2">
                    {overheadPercent}% of materials + labor
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gray-900 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">Total Cost</span>
                    <span className="text-3xl font-black">
                      ₹{costBreakdown.totalCost}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    Minimum price to break even
                  </p>
                </div>
              </motion.div>
            )}

            {/* Pricing Suggestions */}
            {pricing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold text-earth-dark/60 uppercase">
                  Suggested Pricing Tiers
                </h3>

                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-indigo-900">
                      Wholesale Price
                    </span>
                    <span className="text-xs font-bold text-indigo-700">
                      +30% Margin
                    </span>
                  </div>
                  <span className="text-2xl font-black text-indigo-600">
                    ₹{pricing.suggestedWholesale}
                  </span>
                  <p className="text-xs text-indigo-700 mt-2">
                    For bulk buyers, retailers, resellers
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-orange-900">
                      Retail Price
                    </span>
                    <span className="text-xs font-bold text-orange-700">
                      +60% Margin
                    </span>
                  </div>
                  <span className="text-2xl font-black text-orange-600">
                    ₹{pricing.suggestedRetail}
                  </span>
                  <p className="text-xs text-orange-700 mt-2">
                    For direct customer sales, studio visits
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-earth-primary/10 border-2 border-earth-primary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-earth-dark">
                      Marketplace Price
                    </span>
                    <span className="text-xs font-bold text-earth-primary">
                      +50% Margin
                    </span>
                  </div>
                  <span className="text-2xl font-black text-earth-primary">
                    ₹{pricing.suggestedMarketplace}
                  </span>
                  <p className="text-xs text-earth-dark/70 mt-2">
                    For Kumbara-Kala platform, online markets
                  </p>
                </div>
              </motion.div>
            )}

            {/* Current vs Suggested */}
            {pricing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-6 rounded-2xl border-2 ${marginStatus?.bg} ${marginStatus?.color}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase opacity-70">
                      Current Price
                    </p>
                    <p className="text-3xl font-black mt-1">
                      ₹{pricing.currentPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase opacity-70">
                      Margin Status
                    </p>
                    <p className="text-2xl font-black mt-1">
                      {pricing.marginPercentage}%
                    </p>
                  </div>
                </div>

                {pricing.potentialMargin < 0 ? (
                  <p className="text-sm font-bold">
                    ⚠️ You're selling at a loss! Consider raising the price.
                  </p>
                ) : pricing.marginPercentage < 30 ? (
                  <p className="text-sm font-bold">
                    💡 Consider pricing at{' '}
                    <span className="font-black">
                      ₹{pricing.suggestedMarketplace}
                    </span>{' '}
                    to improve your margin.
                  </p>
                ) : (
                  <p className="text-sm font-bold">
                    ✓ Good margin! Keep this price or test{' '}
                    <span className="font-black">₹{pricing.suggestedRetail}</span>{' '}
                    for higher-end markets.
                  </p>
                )}
              </motion.div>
            )}

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-2xl bg-yellow-50 border border-yellow-200 space-y-3"
            >
              <h3 className="text-sm font-bold text-yellow-900">
                💡 Pricing Tips
              </h3>
              <ul className="text-xs text-yellow-800 space-y-2">
                <li>
                  • Artisans often underprice. A 40-60% margin is healthy.
                </li>
                <li>
                  • Include packaging and shipping in overhead calculation.
                </li>
                <li>
                  • Adjust hourly rate based on your experience and market.
                </li>
                <li>
                  • Test different prices on different platforms.
                </li>
              </ul>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <Calculator size={48} className="mx-auto text-earth-dark/20 mb-3" />
            <p className="text-earth-dark/60 font-semibold">
              Add a product to calculate pricing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
