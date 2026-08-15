'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Calendar, KeyRound, Copy, HeartHandshake } from 'lucide-react';
import { registerCouple } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

// Floating Hearts Component
const FloatingHearts = () => {
  const [mounted, setMounted] = React.useState(false);
  const [hearts, setHearts] = React.useState<{ x: number, scale: number, duration: number, size: number }[]>([]);

  React.useEffect(() => {
    setHearts([...Array(12)].map(() => ({
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

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await registerCouple(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success && res.accessCode) {
        setSuccessCode(res.accessCode);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (successCode) {
      navigator.clipboard.writeText(successCode);
      alert('Code copied to clipboard! Save it carefully.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts />
      
      <div className="z-10 w-full max-w-3xl py-4">
        <AnimatePresence mode="wait">
          {!successCode ? (
            <motion.div 
              key="register-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border-2 border-pink-100 dark:border-pink-900/30 shadow-[0_20px_60px_-15px_rgba(255,192,203,0.5)] rounded-[2.5rem] p-6 md:p-8"
            >
              <div className="text-center mb-6">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                  className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-3 shadow-inner"
                >
                  <HeartHandshake className="w-8 h-8 text-pink-500" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-slate-800 dark:text-white mb-2">Build Your Space</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">A romantic journal meant only for the two of you.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-center rounded-2xl font-medium border border-rose-100"
                  >
                    {error}
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Partner 1 Info */}
                  <div className="space-y-4 bg-gradient-to-b from-transparent to-pink-50/50 p-5 rounded-3xl border border-pink-50">
                    <h3 className="text-lg font-serif font-bold text-pink-600 flex items-center justify-center gap-2 mb-4">
                      <Heart className="w-5 h-5" fill="currentColor" />
                      Partner One
                    </h3>
                    <div>
                      <input name="p1Name" required type="text" className="w-full px-4 py-3 bg-white/70 border border-pink-100 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all shadow-sm text-sm" placeholder="Name or Nickname" />
                    </div>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-pink-300" />
                      <input name="p1Dob" type="date" className="w-full pl-11 pr-4 py-3 bg-white/70 border border-pink-100 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all text-slate-600 shadow-sm text-sm" />
                    </div>
                    <div>
                      <input name="p1Hobbies" type="text" className="w-full px-4 py-3 bg-white/70 border border-pink-100 rounded-xl focus:ring-4 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all shadow-sm text-sm" placeholder="Things they love..." />
                    </div>
                  </div>

                  {/* Partner 2 Info */}
                  <div className="space-y-4 bg-gradient-to-b from-transparent to-rose-50/50 p-5 rounded-3xl border border-rose-50">
                    <h3 className="text-lg font-serif font-bold text-rose-500 flex items-center justify-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5" />
                      Partner Two
                    </h3>
                    <div>
                      <input name="p2Name" required type="text" className="w-full px-4 py-3 bg-white/70 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all shadow-sm text-sm" placeholder="Name or Nickname" />
                    </div>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" />
                      <input name="p2Dob" type="date" className="w-full pl-11 pr-4 py-3 bg-white/70 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all text-slate-600 shadow-sm text-sm" />
                    </div>
                    <div>
                      <input name="p2Hobbies" type="text" className="w-full px-4 py-3 bg-white/70 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all shadow-sm text-sm" placeholder="Things they love..." />
                    </div>
                  </div>
                </div>

                <div className="pt-6 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-center text-slate-700 mb-1">Seal the Bond</h3>
                  <p className="text-xs text-center text-slate-500 mb-4">Set a shared key to open your digital space.</p>
                  
                  <div className="relative mb-4 group">
                    <KeyRound className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 group-focus-within:text-pink-500" />
                    <input name="password" required type="password" className="w-full pl-12 pr-4 py-3 bg-white border-2 border-pink-100 rounded-full focus:ring-4 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all shadow-sm font-medium text-sm" placeholder="Your romantic password" />
                  </div>
                  
                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full py-3 px-6 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-full shadow-[0_10px_20px_rgba(251,113,133,0.4)] hover:shadow-[0_15px_30px_rgba(251,113,133,0.5)] transform hover:-translate-y-1 transition-all disabled:opacity-70 flex items-center justify-center text-base"
                  >
                    {isSubmitting ? 'Creating Space...' : 'Begin Journey'}
                  </button>
                </div>

                <p className="text-center text-sm font-medium text-slate-500">
                  Already mapped your journey? <a href="/login" className="text-pink-600 font-bold hover:underline underline-offset-2">Return Home</a>
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1 }}
              className="bg-white/90 backdrop-blur-2xl border-4 border-pink-200 shadow-[0_20px_60px_-15px_rgba(255,192,203,0.6)] rounded-[3rem] p-10 md:p-16 text-center max-w-xl mx-auto"
            >
              <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-pink-100 text-pink-500 mb-8 shadow-inner">
                <Heart className="w-12 h-12" fill="currentColor" />
              </div>
              <h2 className="text-4xl font-serif italic font-bold text-slate-800 mb-4">It's Official!</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">Your couple space is ready. Protect this magical code, as it's the only key (along with your password) to access your shared memories.</p>
              
              <div className="bg-pink-50 border-2 border-pink-200 p-6 rounded-3xl flex items-center justify-between mb-10 shadow-inner">
                <span className="text-3xl font-black text-rose-500 tracking-[0.2em]">{successCode}</span>
                <button onClick={copyCode} className="p-3 bg-white hover:bg-pink-100 rounded-xl transition-colors text-pink-600 shadow-sm" title="Copy to clipboard">
                  <Copy className="w-6 h-6" />
                </button>
              </div>

              <button 
                onClick={() => router.push('/')}
                className="py-4 px-10 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
