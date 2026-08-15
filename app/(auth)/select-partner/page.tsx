'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, ArrowLeft, Heart } from 'lucide-react';
import { getCoupleProfile } from '@/app/actions/couple';
import { loginPartner, createPartnerPin } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { Partner } from '@/store/useCoupleStore';
import { useI18nStore } from '@/store/useI18nStore';

export default function SelectPartnerPage() {
  const { dict } = useI18nStore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner & { has_pin?: boolean } | null>(null);
  
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadPartners() {
      const res = await getCoupleProfile();
      if (res.error || !res.data) {
        router.push('/login');
      } else {
        // Evaluate if pin_code is set
        const partnersWithPinStatus = res.data.partners.map((p: any) => ({
          ...p,
          has_pin: !!p.pin_code
        }));
        setPartners(partnersWithPinStatus);
      }
      setLoading(false);
    }
    loadPartners();
  }, [router]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || pin.length < 4) return;
    
    setIsSubmitting(true);
    setError(null);

    let res;
    if (selectedPartner.has_pin) {
      res = await loginPartner(selectedPartner.id, pin);
    } else {
      res = await createPartnerPin(selectedPartner.id, pin);
    }

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-pink-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl z-10"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl border flex flex-col items-center border-pink-100 dark:border-pink-900/30 shadow-xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden min-h-[400px]">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-2">
              {dict.auth.selectPartnerTitle}
            </h1>
            <p className="text-slate-500 text-sm">{dict.auth.selectPartnerSubtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {!selectedPartner ? (
              <motion.div 
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full flex justify-center gap-6"
              >
                {partners.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartner(p as any)}
                    className="flex flex-col items-center gap-4 bg-pink-50 hover:bg-pink-100 p-6 rounded-[2rem] transition-all transform hover:scale-105 border border-pink-100 shadow-sm w-40"
                  >
                    <img 
                      src={p.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${p.name}`} 
                      className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover bg-white" 
                      alt="" 
                    />
                    <div className="font-bold text-slate-700 text-lg flex items-center gap-2">
                      {p.name}
                      {!(p as any).has_pin && (
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={dict.auth.noPinYet} />
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.form 
                key="pin"
                onSubmit={handlePinSubmit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full max-w-sm flex flex-col items-center gap-6"
              >
                <div className="flex flex-col items-center gap-2">
                   <img 
                      src={selectedPartner.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${selectedPartner.name}`} 
                      className="w-16 h-16 rounded-full border-4 border-pink-100 shadow-sm object-cover bg-white" 
                      alt="" 
                    />
                    <p className="font-bold text-slate-600">Chào {selectedPartner.name}</p>
                </div>

                <div className="w-full text-center space-y-4 relative">
                   <Lock className="w-6 h-6 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input
                     autoFocus
                     type="password"
                     maxLength={4}
                     value={pin}
                     onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} // only numbers
                     placeholder={selectedPartner.has_pin ? dict.auth.enterPin : dict.auth.createPin}
                     className="w-full pl-14 pr-4 py-4 text-center rounded-2xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none text-2xl tracking-[0.5em] font-bold text-slate-700 transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                   />
                   {error && <p className="text-rose-500 text-sm font-bold animate-pulse">{error}</p>}
                </div>

                <div className="w-full flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setSelectedPartner(null); setPin(''); setError(null); }}
                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <button 
                    disabled={pin.length < 4 || isSubmitting}
                    type="submit" 
                    className="flex-1 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (selectedPartner.has_pin ? dict.auth.unlockBtn : dict.auth.savePinBtn)}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
