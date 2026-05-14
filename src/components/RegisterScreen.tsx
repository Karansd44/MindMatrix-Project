/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Briefcase, Languages, Camera, AlertCircle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserProfile } from '../services/userService';
import AuthLayout from './AuthLayout';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { useToast } from './ToastProvider';

interface RegisterScreenProps {
  onLoginClick: () => void;
}

export default function RegisterScreen({ onLoginClick }: RegisterScreenProps) {
  const toast = useToast();
  const [role, setRole] = useState<'artisan' | 'customer'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [artisanType, setArtisanType] = useState('');
  const [languagePref, setLanguagePref] = useState<Language>('en');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetOptions, setShowResetOptions] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const getAuthErrorMessage = (err: any, isSignInAttempt: boolean = false) => {
    if (err?.code) {
      // User-friendly error messages
      const errorMap: { [key: string]: string } = {
        'auth/email-already-in-use': 'This email is already registered. Please log in instead or use a different email.',
        'auth/wrong-password': isSignInAttempt 
          ? 'This email is already registered but the password is incorrect. Please log in or reset your password.'
          : 'Invalid password. Please check your password and try again.',
        'auth/weak-password': 'Password must be at least 6 characters long.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/too-many-requests': 'Too many login attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
      };
      
      return errorMap[err.code] || `${err.code}: ${err.message || 'Registration failed'}`;
    }
    return err?.message || 'Registration failed';
  };

  const saveProfile = async (userId: string) => {
    const profileData: any = {
      userId,
      name,
      email: email.trim().toLowerCase(),
      phone,
      role,
      languagePreference: languagePref,
      createdAt: new Date().toISOString(),
    };

    if (role === 'artisan') {
      profileData.village = village;
      profileData.artisanType = artisanType;
      profileData.experience = 0;
      profileData.heritageStory = '';
    }

    try {
      await createUserProfile(userId, profileData);
      console.log('Profile saved successfully via userService');
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      throw new Error(`Failed to save profile: ${firestoreError.message}`);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      // Send verification email
      try {
        await user.reload();
        console.log('User created. Email verification required to save profile.');
        setError(null);
        // Show success message
        setError(null);
      } catch (emailError: any) {
        console.error('Email verification error:', emailError);
      }

      // Try to save profile - it will work if email gets verified
      try {
        await saveProfile(user.uid);
        console.log('✅ Registration complete - profile saved for', user.uid);
        toast.push('success', `Welcome! Profile saved. You are now a ${role}.`);
        // Give Firestore a moment to persist before AuthContext fetches
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Profile should now be available in Firestore');
      } catch (profileError: any) {
        console.warn('Initial profile save may require email verification. User can complete profile after verification.');
        toast.push('info', 'Account created. Complete profile after verification.');
      }
    } catch (err: any) {
      // If the email is already in use, don't attempt automatic sign-in — prompt user instead
      if (err?.code === 'auth/email-already-in-use') {
        setShowResetOptions(true);
        setError(getAuthErrorMessage(err));
        return;
      }

      const msg = getAuthErrorMessage(err);
      setError(msg);
      toast.push('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the Legacy Network">
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="flex bg-earth-light/20 p-2 rounded-2xl gap-2">
          <button 
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'customer' ? 'bg-earth-dark text-white shadow-lg' : 'text-earth-dark/40 hover:bg-earth-light/30'}`}
          >
            Customer
          </button>
          <button 
            type="button"
            onClick={() => setRole('artisan')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === 'artisan' ? 'bg-earth-dark text-white shadow-lg' : 'text-earth-dark/40 hover:bg-earth-light/30'}`}
          >
            Artisan
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold overflow-hidden"
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 max-h-[40vh] overflow-y-auto px-1">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
              required
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
            <input 
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
              required
            />
          </div>

          <div className="relative group">
            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
            <input 
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
              required
            />
          </div>

          {role === 'artisan' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="relative group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Village Name"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
                  required
                />
              </div>
              <div className="relative group">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Artisan Type (e.g. Potter)"
                  value={artisanType}
                  onChange={e => setArtisanType(e.target.value)}
                  className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
                  required
                />
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 focus-within:text-earth-primary transition-colors" size={16} />
              <input 
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-earth-light/30 border-none rounded-2xl py-3 pl-12 pr-4 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20 text-sm"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 focus-within:text-earth-primary transition-colors" size={16} />
              <input 
                type="password"
                placeholder="Confirm"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-earth-light/30 border-none rounded-2xl py-3 pl-12 pr-4 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20 text-sm"
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-earth-dark text-white py-5 rounded-3xl font-black text-lg hover:bg-earth-primary transition-all active:scale-95 shadow-xl shadow-earth-dark/10 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : (
            <>
              <UserPlus size={20} />
              Register
            </>
          )}
        </button>

        {showResetOptions ? (
          <div className="space-y-2">
            {resetSent ? (
              <div className="text-sm text-center text-earth-primary font-bold">Password reset email sent. Check your inbox.</div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="flex-1 py-3 rounded-2xl bg-white border border-earth-dark/10 text-earth-primary font-bold"
                >
                  Go to Login
                </button>
                <button
                  type="button"
                  onClick={handleSendReset}
                  className="flex-1 py-3 rounded-2xl bg-earth-primary text-white font-bold"
                >
                  Send Password Reset
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-xs font-bold text-earth-dark/40">
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={onLoginClick}
              className="text-earth-primary hover:underline"
            >
              Login
            </button>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
