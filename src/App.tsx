/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import GalleryScreen from './components/GalleryScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authState, setAuthState] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-earth-bg flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-earth-primary"
        >
          <Loader2 size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-earth-dark bg-earth-bg">
      <AnimatePresence mode="wait">
        {!user ? (
          authState === 'login' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LoginScreen 
                onRegisterClick={() => setAuthState('register')} 
                onForgotPasswordClick={() => {}}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RegisterScreen 
                onLoginClick={() => setAuthState('login')} 
              />
            </motion.div>
          )
        ) : (
          <motion.div 
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GalleryScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
