'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, KeyRound, Hash } from 'lucide-react';
import { loginCouple } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useI18nStore } from '@/store/useI18nStore';

// Floating Hearts Component for Romantic Vibe
const FloatingHearts = () => {
  const [mounted, setMounted] = React.useState(false);
  const [hearts, setHearts] = React.useState<{ x: number, scale: number, duration: number, size: number }[]>([]);

  React.useEffect(() => {
    setHearts([...Array(8)].map(() => ({
      x: Math.random() * 100,
      scale: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 15 + 15,
      size: Math.random() * 40 + 20
    })));
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-300/30"
          initial={{ y: "110vh", x: `${h.x}vw`, scale: h.scale }}
          animate={{ y: "-10vh", rotate: 360, x: `${h.x}vw` }}
          transition={{ duration: h.duration, repeat: Infinity, ease: "linear" }}
        >
          <Heart fill="currentColor" size={h.size} />
        </motion.div>
      ))}
    </div>
  );
};

export default function LoginPage() {
  const { dict } = useI18nStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginCouple(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        router.push('/select-partner');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border-2 border-pink-100 dark:border-pink-900/30 shadow-[0_20px_60px_-15px_rgba(255,192,203,0.5)] rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
          
          {/* Top Decorative Header */}
          <div className="text-center mb-10">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-4 shadow-inner"
            >
              <Heart className="w-10 h-10 text-pink-500" fill="currentColor" />
            </motion.div>
            <h1 className="text-4xl font-serif italic font-bold text-slate-800 dark:text-white mb-2">{dict.auth.welcomeTitle}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{dict.auth.welcomeSubtitle}</p>
          </div>

          <motion.form 
             onSubmit={handleSubmit}
             className="space-y-6"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 rounded-2xl text-sm border border-rose-100 text-center"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-5">
              <div className="group relative">
                <Hash className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-500 transition-colors" />
                <input 
                  name="code" 
                  required 
                  type="text" 
                  className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-slate-700/50 border-2 border-pink-100/50 dark:border-slate-600 rounded-full focus:ring-4 focus:ring-pink-200/50 focus:border-pink-400 outline-none transition-all font-bold text-slate-700 dark:text-white uppercase tracking-widest placeholder:font-normal placeholder:lowercase shadow-sm hover:border-pink-200" 
                  placeholder={dict.auth.codePlaceholder}
                />
              </div>

              <div className="group relative">
                <KeyRound className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-500 transition-colors" />
                <input 
                  name="password" 
                  required 
                  type="password" 
                  className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-slate-700/50 border-2 border-pink-100/50 dark:border-slate-600 rounded-full focus:ring-4 focus:ring-pink-200/50 focus:border-pink-400 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:font-normal shadow-sm hover:border-pink-200" 
                  placeholder={dict.auth.pwdPlaceholder}
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit" 
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-full shadow-[0_10px_25px_-5px_rgba(251,113,133,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(251,113,133,0.6)] transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>{dict.auth.enterSpace} <Heart className="w-4 h-4 ml-1" fill="currentColor"/></>
              )}
            </button>
          </motion.form>

        </div>
        
        <p className="text-center text-sm font-medium text-pink-900/60 dark:text-pink-200/60 mt-8">
          {dict.auth.noSpace}{' '}
          <a href="/register" className="text-pink-600 dark:text-pink-400 font-bold hover:underline decoration-2 underline-offset-4">{dict.auth.createHere}</a>
        </p>
      </motion.div>
    </div>
  );
}
