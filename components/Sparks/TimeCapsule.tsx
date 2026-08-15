'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, Mail, X, Plus, Loader2 } from 'lucide-react';
import { getTimeCapsules, addTimeCapsule, openTimeCapsule } from '@/app/actions/sparks';
import { useCoupleStore } from '@/store/useCoupleStore';
import { TimeCapsuleLetter } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18nStore } from '@/store/useI18nStore';

export default function TimeCapsule() {
  const { dict } = useI18nStore();
  const [isOpen, setIsOpen] = useState(false);
  const [capsules, setCapsules] = useState<TimeCapsuleLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'boxes'|'create'>('boxes');

  // Create Form form
  const [content, setContent] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser, partnerUser } = useCoupleStore();

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCapsules();
    }
  }, [isOpen, currentUser]);

  const loadCapsules = async () => {
    setLoading(true);
    const res = await getTimeCapsules();
    if (res.data) setCapsules(res.data);
    setLoading(false);
  };

  const handleOpenCapsule = async (id: string, dateStr: string) => {
    const isFuture = new Date(dateStr) > new Date();
    if (isFuture) {
      alert(dict.timeCapsule.notTimeYetAlert);
      return;
    }
    const res = await openTimeCapsule(id);
    if (res.success) {
      loadCapsules();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !partnerUser || !content || !openDate) return;
    setIsSubmitting(true);
    
    // YYYY-MM-DD to ISO 
    const isodate = new Date(openDate).toISOString();

    const res = await addTimeCapsule(currentUser.id, partnerUser.id, content, isodate);
    if (res.success) {
      setContent('');
      setOpenDate('');
      setTab('boxes');
      loadCapsules();
    }
    setIsSubmitting(false);
  };

  const myCapsules = capsules.filter(c => c.receiver_id === currentUser?.id);
  const sentCapsules = capsules.filter(c => c.sender_id === currentUser?.id);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full h-full bg-slate-800 text-white rounded-[2.5rem] border border-slate-700 p-6 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-700 transition-colors"
      >
        <Lock className="w-10 h-10 mb-3 text-slate-400" />
        <h3 className="font-bold text-lg">{dict.timeCapsule.title}</h3>
        <p className="text-sm font-medium text-slate-400 mt-1 max-w-[150px]">{dict.timeCapsule.subtitle}</p>
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
              className="relative w-full max-w-xl bg-[#f8f9fa] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 text-slate-600 p-2 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-xl text-slate-800">{dict.timeCapsule.title}</h2>
                    <p className="text-xs text-slate-500">{dict.timeCapsule.subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex bg-white px-2 pt-2 border-b border-slate-200">
                <button 
                  onClick={() => setTab('boxes')}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'boxes' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {dict.timeCapsule.tabBoxes}
                </button>
                <button 
                  onClick={() => setTab('create')}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'create' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {dict.timeCapsule.tabCreate}
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 relative custom-scrollbar bg-slate-50">
                {loading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : tab === 'create' ? (
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">{dict.timeCapsule.contentLabel}</label>
                          <textarea 
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={dict.timeCapsule.contentPlaceholder}
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-slate-400 focus:bg-white transition-colors text-sm resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-1">{dict.timeCapsule.dateLabel}</label>
                          <input 
                            required
                            type="date"
                            value={openDate}
                            onChange={(e) => setOpenDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]} // from today
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-slate-400 text-sm"
                          />
                        </div>
                        <button
                          disabled={!content || !openDate || isSubmitting}
                          type="submit"
                          className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                          {dict.timeCapsule.lockAndSendBtn}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8">
                    {/* Inbox */}
                    <div>
                      <h3 className="font-bold text-slate-700 mb-4">
                        {dict.timeCapsule.received} ({myCapsules.length})
                      </h3>
                      {myCapsules.length === 0 ? (
                        <p className="text-sm text-slate-500 bg-slate-200/50 p-4 rounded-xl text-center border-dashed border-2 border-slate-200">
                          {dict.timeCapsule.noReceived}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {myCapsules.map(c => {
                            const isPast = new Date(c.open_date) <= new Date();
                            const formattedDate = new Date(c.open_date).toLocaleDateString('vi-VN');
                            return (
                            <div key={c.id} className="relative bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 overflow-hidden flex flex-col group">
                              {!c.is_opened ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-4">
                                  <Lock className={`w-10 h-10 ${isPast ? 'text-amber-500' : 'text-slate-300'}`} />
                                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formattedDate}</div>
                                  <button
                                    onClick={() => handleOpenCapsule(c.id, c.open_date)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${isPast ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer pointer-events-auto' : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-auto'}`}
                                  >
                                    {isPast ? dict.timeCapsule.readyToOpenBtn : dict.timeCapsule.stillLockedBtn}
                                  </button>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col">
                                  <div className="flex items-center gap-2 mb-3 text-emerald-500">
                                    <Unlock className="w-4 h-4" />
                                    <span className="text-xs font-bold">{dict.timeCapsule.unlockedMsg} ({formattedDate})</span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-700 italic border-l-2 border-emerald-200 pl-3 leading-relaxed whitespace-pre-wrap">"{c.content}"</p>
                                </div>
                              )}
                            </div>
                          )})}
                        </div>
                      )}
                    </div>

                    {/* Outbox */}
                    <div>
                      <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-widest">
                        {dict.timeCapsule.sentByYou} ({sentCapsules.length})
                      </h3>
                      {sentCapsules.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 opacity-70">
                          {sentCapsules.map(c => (
                            <div key={c.id} className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
                               <Lock className="w-4 h-4 text-slate-400" />
                               <span className="text-[10px] font-bold text-slate-500">{new Date(c.open_date).toLocaleDateString()}</span>
                               <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-full">
                                {c.is_opened ? dict.timeCapsule.openedByPartner : dict.timeCapsule.unreadByPartner}
                               </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
