'use client';

import { useState, useEffect } from 'react';
import { Ticket, X, Plus, Gift, CheckCircle2, Loader2 } from 'lucide-react';
import { getLoveCoupons, addLoveCoupon, redeemLoveCoupon } from '@/app/actions/sparks';
import { useCoupleStore } from '@/store/useCoupleStore';
import { LoveCoupon } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18nStore } from '@/store/useI18nStore';

export default function LoveCoupons() {
  const { dict } = useI18nStore();
  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState<LoveCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'wallet'|'create'>('wallet');

  // Create Form form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, partnerUser } = useCoupleStore();

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCoupons();
    }
  }, [isOpen, currentUser]);

  const loadCoupons = async () => {
    setLoading(true);
    const res = await getLoveCoupons();
    if (res.data) setCoupons(res.data);
    setLoading(false);
  };

  const handleRedeem = async (id: string) => {
    if (!confirm(dict.loveCoupons.confirmRedeemAlert)) return;
    const res = await redeemLoveCoupon(id);
    if (res.success) {
      loadCoupons();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !partnerUser || !title) return;
    setIsSubmitting(true);
    const res = await addLoveCoupon(currentUser.id, partnerUser.id, title, desc);
    if (res.success) {
      setTitle('');
      setDesc('');
      setTab('wallet');
      loadCoupons();
    }
    setIsSubmitting(false);
  };

  const myWalletAll = coupons.filter(c => c.receiver_id === currentUser?.id);
  const myWallet = myWalletAll.filter(c => !c.is_used);
  const myUsed = myWalletAll.filter(c => c.is_used);

  const sentAll = coupons.filter(c => c.sender_id === currentUser?.id);
  const sentByMe = sentAll.filter(c => !c.is_used);
  const sentUsed = sentAll.filter(c => c.is_used);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-[2.5rem] border border-amber-300 p-6 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
      >
        <Ticket className="w-10 h-10 mb-3 text-amber-100" />
        <h3 className="font-serif font-bold text-2xl">{dict.loveCoupons.title}</h3>
        <p className="text-sm font-medium text-amber-100 mt-1">{dict.loveCoupons.subtitle}</p>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#fff5f8] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-5 border-b border-pink-100 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-xl text-slate-800">{dict.loveCoupons.title}</h2>
                    <p className="text-xs text-slate-500">{dict.loveCoupons.subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex bg-white px-2 pt-2 border-b border-pink-100">
                <button 
                  onClick={() => setTab('wallet')}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'wallet' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {dict.loveCoupons.tabWallet}
                </button>
                <button 
                  onClick={() => setTab('create')}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'create' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {dict.loveCoupons.tabCreate}
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 relative custom-scrollbar">
                {loading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  </div>
                ) : tab === 'create' ? (
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-3xl border border-orange-100">
                      <div className="flex items-center gap-3 mb-6">
                        <Gift className="w-6 h-6 text-pink-500" />
                        <h3 className="font-bold text-slate-800">{dict.loveCoupons.tabCreate}</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">{dict.loveCoupons.createTitleLabel}</label>
                          <input 
                            required
                            maxLength={50}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={dict.loveCoupons.createTitlePlaceholder}
                            className="w-full px-4 py-3 rounded-xl border-slate-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">{dict.loveCoupons.createDescLabel}</label>
                          <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder={dict.loveCoupons.createDescPlaceholder}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-slate-200 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-sm resize-none"
                          />
                        </div>
                        <button
                          disabled={!title || isSubmitting}
                          type="submit"
                          className="w-full bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                          {dict.loveCoupons.sendBtn}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    {/* My Wallet */}
                    <div>
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-amber-500" />
                        {dict.loveCoupons.available} ({myWallet.length})
                      </h3>
                      {myWallet.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-white/50 p-4 rounded-xl text-center border-dashed border-2 border-slate-200">
                          {dict.loveCoupons.emptyWallet}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {myWallet.map(c => (
                            <div key={c.id} className="relative bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-l-4 border-amber-400 flex items-center gap-4 group">
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{c.title}</h4>
                                {c.description && <p className="text-xs text-slate-500 mt-1">{c.description}</p>}
                              </div>
                              <button
                                onClick={() => handleRedeem(c.id)}
                                className="bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                              >
                                {dict.loveCoupons.redeemBtn}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {myUsed.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-400 mb-4 flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {dict.loveCoupons.historyUsed} ({myUsed.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                          {myUsed.map(c => (
                            <div key={c.id} className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                              <h4 className="font-bold text-slate-700 text-sm line-through">{c.title}</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sent by me */}
                    <div>
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-pink-400" />
                        {dict.loveCoupons.sentByMe} ({sentByMe.length})
                      </h3>
                      {sentByMe.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                          {sentByMe.map(c => (
                            <div key={c.id} className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                              <h4 className="font-bold text-slate-700 text-sm">{c.title}</h4>
                              {c.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{c.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {sentUsed.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-400 mb-4 flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {dict.loveCoupons.sentUsed} ({sentUsed.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                          {sentUsed.map(c => (
                            <div key={c.id} className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                              <h4 className="font-bold text-slate-700 text-sm line-through">{c.title}</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
