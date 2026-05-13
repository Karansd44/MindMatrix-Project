/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Palette } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-earth-bg flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex bg-earth-dark p-4 rounded-3xl mb-6 shadow-xl shadow-earth-dark/20 text-white">
            <Palette size={40} />
          </div>
          <h1 className="text-4xl font-black text-earth-dark tracking-tight mb-2">
            Kumbara-Kala
          </h1>
          <p className="text-earth-dark/40 font-bold uppercase tracking-[0.2em] text-xs">
            {subtitle}
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[48px] shadow-2xl shadow-earth-dark/5 border border-earth-dark/5"
        >
          <h2 className="text-2xl font-black text-earth-dark mb-8">{title}</h2>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
