/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signInWithRedirect, getRedirectResult, sendPasswordResetEmail } from 'firebase/auth';
import { LogIn, Mail, Lock, Chrome, MessageSquare, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import AuthLayout from './AuthLayout';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

export default function LoginScreen({ onRegisterClick, onForgotPasswordClick }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Google redirect sign-in completed:', result.user.email);
        }
      })
      .catch((err: any) => {
        setError(err?.code ? `${err.code}: ${err.message}` : err?.message || 'Redirect login failed');
      });
  }, []);

  const getAuthErrorMessage = (err: any) => {
    if (err?.code) {
      // User-friendly error messages
      const errorMap: { [key: string]: string } = {
        'auth/email-already-in-use': 'This email is already registered. Please try logging in.',
        'auth/wrong-password': 'Incorrect password. Please check and try again.',
        'auth/weak-password': 'Password must be at least 6 characters long.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email. Please register first.',
        'auth/too-many-requests': 'Too many login attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your internet connection.',
        'auth/popup-blocked': 'Pop-up blocked. Please allow pop-ups for this site.',
      };
      
      return errorMap[err.code] || `${err.code}: ${err.message || 'Authentication failed'}`;
    }
    return err?.message || 'Authentication failed';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);
    setResetSent(false);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setError('Please enter your email address first.');
        return;
      }

      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Legacy Craft Login">
      <form onSubmit={handleEmailLogin} className="space-y-6">
        <AnimatePresence>
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

        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
            <input 
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-earth-dark/20 group-focus-within:text-earth-primary transition-colors" size={20} />
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-earth-light/30 border-none rounded-3xl py-4 pl-14 pr-6 font-bold text-earth-dark placeholder:text-earth-dark/20 focus:ring-2 focus:ring-earth-primary/20"
              required
            />
          </div>
        </div>

        <button 
          type="button" 
          onClick={handleForgotPassword}
          className="text-xs font-black text-earth-primary uppercase tracking-widest hover:underline block text-right"
        >
          Forgot Password?
        </button>

        {resetSent && (
          <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-xs font-bold">
            Password reset email sent. Check your inbox.
          </div>
        )}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-earth-dark text-white py-5 rounded-3xl font-black text-lg hover:bg-earth-primary transition-all active:scale-95 shadow-xl shadow-earth-dark/10 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : (
            <>
              <LogIn size={20} />
              Login
            </>
          )}
        </button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-earth-dark/5"></div>
          </div>
          <span className="relative px-4 bg-white text-[10px] font-black uppercase text-earth-dark/20 tracking-widest">Or Continue With</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 py-4 bg-white border border-earth-dark/10 rounded-2xl hover:border-earth-primary transition-all active:scale-95"
          >
            <Chrome size={20} />
            <span className="text-sm font-bold text-earth-dark">Google</span>
          </button>
          <button 
            type="button"
            onClick={() => setError('Phone OTP login coming soon!')}
            className="flex items-center justify-center gap-3 py-4 bg-white border border-earth-dark/10 rounded-2xl hover:border-earth-primary transition-all active:scale-95"
          >
            <MessageSquare size={20} />
            <span className="text-sm font-bold text-earth-dark">OTP</span>
          </button>
        </div>

        <p className="text-center text-xs font-bold text-earth-dark/40">
          Don't have an account?{' '}
          <button 
            type="button" 
            onClick={onRegisterClick}
            className="text-earth-primary hover:underline"
          >
            Register Now
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
