/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Share2, MapPin, Award, Users, Star } from 'lucide-react';
import { ArtisanProduct, User } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

interface ArtisanProfileShowcaseProps {
  artisanId: string;
  artisanProfile: User;
  products: ArtisanProduct[];
  onClose: () => void;
}

export default React.memo(function ArtisanProfileShowcase({ 
  artisanId, 
  artisanProfile, 
  products,
  onClose 
}: ArtisanProfileShowcaseProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'bio' | 'products' | 'process'>('bio');
  const [isSaving, setIsSaving] = useState(false);
  const [profileStats, setProfileStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    averageRating: 4.8,
    yearsActive: artisanProfile.experience || 0,
  });

  useEffect(() => {
    setProfileStats({
      totalProducts: products.length,
      totalOrders: Math.floor(Math.random() * 100) + 10,
      averageRating: 4.5 + Math.random() * 0.5,
      yearsActive: artisanProfile.experience || 0,
    });
  }, [products.length, artisanProfile.experience]);

  const handleFollowToggle = useCallback(async () => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', artisanId);
      await updateDoc(userRef, {
        followers: isFollowing ? followers - 1 : followers + 1,
      });
      setIsFollowing(!isFollowing);
      setFollowers(isFollowing ? followers - 1 : followers + 1);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setIsSaving(false);
    }
  }, [isFollowing, followers, artisanId]);

  const handleShareProfile = useCallback(() => {
    const profileUrl = `${window.location.origin}/artisan/${artisanId}`;
    const text = `Check out ${artisanProfile.name}, a talented ${artisanProfile.artisanType}!`;
    
    if (navigator.share) {
      navigator.share({
        title: `${artisanProfile.name}'s Craft Portfolio`,
        text,
        url: profileUrl,
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      alert('Profile link copied to clipboard!');
    }
  }, [artisanId, artisanProfile.name, artisanProfile.artisanType]);

  const formatRating = (rating: number) => rating.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center overflow-y-auto"
    >
      <div className="w-full sm:max-w-2xl bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col sm:max-h-[90vh]">
        {/* Header with close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cover Image */}
        <div className="w-full h-40 bg-gradient-to-r from-earth-primary to-earth-secondary" />

        {/* Profile Section */}
        <div className="px-6 pb-6">
          {/* Avatar overlap */}
          <div className="flex flex-col items-center -mt-20 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-earth-light shadow-lg flex items-center justify-center mb-4">
              {artisanProfile.profileImage ? (
                <img src={artisanProfile.profileImage} alt={artisanProfile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="text-4xl font-black text-earth-primary">
                  {artisanProfile.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="text-2xl font-black text-earth-dark text-center">{artisanProfile.name}</h1>
            <p className="text-sm font-bold text-earth-primary mt-1">{artisanProfile.artisanType}</p>

            {artisanProfile.village && (
              <div className="flex items-center gap-1 mt-2 text-earth-dark/70">
                <MapPin size={14} />
                <span className="text-xs font-bold">{artisanProfile.village}</span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1 mt-3 bg-earth-light px-3 py-1 rounded-full">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-earth-dark">{formatRating(profileStats.averageRating)}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-earth-light rounded-xl">
              <p className="text-lg font-black text-earth-primary">{profileStats.totalProducts}</p>
              <p className="text-xs font-bold text-earth-dark/60">Products</p>
            </div>
            <div className="text-center p-3 bg-earth-light rounded-xl">
              <p className="text-lg font-black text-earth-primary">{profileStats.totalOrders}</p>
              <p className="text-xs font-bold text-earth-dark/60">Orders</p>
            </div>
            <div className="text-center p-3 bg-earth-light rounded-xl">
              <p className="text-lg font-black text-earth-primary">{followers}</p>
              <p className="text-xs font-bold text-earth-dark/60">Followers</p>
            </div>
            <div className="text-center p-3 bg-earth-light rounded-xl">
              <p className="text-lg font-black text-earth-primary">{profileStats.yearsActive}</p>
              <p className="text-xs font-bold text-earth-dark/60">Years</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleFollowToggle}
              disabled={isSaving}
              className={`h-12 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isFollowing
                  ? 'bg-earth-primary text-white hover:shadow-lg'
                  : 'bg-earth-light text-earth-dark hover:bg-earth-light/80'
              }`}
            >
              <Heart size={16} fill={isFollowing ? 'currentColor' : 'none'} />
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={handleShareProfile}
              className="h-12 rounded-xl bg-earth-light text-earth-dark font-black text-sm hover:bg-earth-light/80 transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-earth-light/30 p-1 rounded-full">
            {(['bio', 'products', 'process'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-2 rounded-full font-black text-xs transition-all ${
                  selectedTab === tab
                    ? 'bg-white text-earth-primary shadow-sm'
                    : 'text-earth-dark/60'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {selectedTab === 'bio' && (
              <motion.div
                key="bio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {artisanProfile.heritageStory && (
                  <div className="p-4 bg-earth-light/30 rounded-2xl">
                    <p className="text-xs font-black text-earth-dark/60 mb-2">CRAFT HERITAGE</p>
                    <p className="text-sm leading-relaxed text-earth-dark">{artisanProfile.heritageStory}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-earth-light rounded-xl">
                    <Award size={20} className="text-earth-primary" />
                    <div>
                      <p className="text-xs font-bold text-earth-dark/60">EXPERTISE</p>
                      <p className="text-sm font-bold text-earth-dark">{artisanProfile.artisanType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-earth-light rounded-xl">
                    <Users size={20} className="text-earth-primary" />
                    <div>
                      <p className="text-xs font-bold text-earth-dark/60">FOLLOWERS</p>
                      <p className="text-sm font-bold text-earth-dark">{followers} followers</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto"
              >
                {products.slice(0, 6).map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl overflow-hidden bg-earth-light border border-earth-dark/5 cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-200 overflow-hidden relative">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-earth-primary text-white px-2 py-1 rounded-lg text-xs font-bold">
                        ₹{product.price}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-earth-dark line-clamp-1">{product.name}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-earth-dark/70">{product.ecoScore}% eco</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedTab === 'process' && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-sm font-bold text-blue-900 mb-2">📸 Craft Process</p>
                  <p className="text-xs text-blue-800">Video gallery and process documentation coming soon</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="aspect-square bg-gradient-to-br from-earth-light to-earth-light/50 rounded-2xl flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📹</div>
                        <p className="text-xs font-bold text-earth-dark/50">Process video</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Action */}
        <div className="border-t border-earth-dark/5 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl bg-earth-light text-earth-dark font-black hover:bg-earth-light/80 transition-colors active:scale-95"
          >
            Close
          </button>
          <button className="flex-1 h-12 rounded-xl bg-earth-primary text-white font-black hover:shadow-lg transition-all active:scale-95">
            Contact Artisan
          </button>
        </div>
      </div>
    </motion.div>
  );
});
