'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, KeyRound, Save, Loader2, Camera } from 'lucide-react';
import { useCoupleStore, Partner, Couple } from '@/store/useCoupleStore';
import { updatePartnerProfile, updateCoupleProfile, uploadAvatar } from '@/app/actions/couple';
import { logoutCouple } from '@/app/actions/auth';
import { useI18nStore } from '@/store/useI18nStore';

const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'pixel-art'];

export default function ProfileSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { dict } = useI18nStore();
  const { couple, partners, updatePartnerInStore, updateCoupleInStore } = useCoupleStore();
  const [isSaving, setIsSaving] = useState(false);

  // Local state copy for form
  const [p1, setP1] = useState<Partner | null>(partners[0] || null);
  const [p2, setP2] = useState<Partner | null>(partners[1] || null);
  const [cState, setCState] = useState<Couple | null>(couple);

  // Sync state if modal opens
  React.useEffect(() => {
    if (isOpen) {
      setP1(partners[0] || null);
      setP2(partners[1] || null);
      setCState(couple);
    }
  }, [isOpen, partners, couple]);

  const handleAvatarUpload = async (partnerNum: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsSaving(true);
    const formData = new FormData();
    formData.append('image', file);
    
    if (partnerNum === 1 && p1) {
      formData.append('partnerId', p1.id);
      const res = await uploadAvatar(formData);
      if (res.success && res.data) {
        setP1(res.data as Partner);
        updatePartnerInStore(res.data as Partner);
      } else {
        alert("Failed to upload avatar: " + res.error);
      }
    } else if (partnerNum === 2 && p2) {
      formData.append('partnerId', p2.id);
      const res = await uploadAvatar(formData);
      if (res.success && res.data) {
        setP2(res.data as Partner);
        updatePartnerInStore(res.data as Partner);
      } else {
        alert("Failed to upload avatar: " + res.error);
      }
    }
    setIsSaving(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Update p1
    if (p1 && JSON.stringify(p1) !== JSON.stringify(partners[0])) {
      const res = await updatePartnerProfile(p1.id, { name: p1.name, dob: p1.dob, hobbies: p1.hobbies, avatar_url: p1.avatar_url, email: p1.email });
      if (res.success && res.data) updatePartnerInStore(res.data);
    }
    // Update p2
    if (p2 && JSON.stringify(p2) !== JSON.stringify(partners[1])) {
      const res = await updatePartnerProfile(p2.id, { name: p2.name, dob: p2.dob, hobbies: p2.hobbies, avatar_url: p2.avatar_url, email: p2.email });
      if (res.success && res.data) updatePartnerInStore(res.data);
    }
    // Update couple
    if (cState && couple && cState.start_date !== couple.start_date) {
      const res = await updateCoupleProfile({ start_date: cState.start_date });
      if (res.success && res.data) updateCoupleInStore(res.data);
    }
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-serif font-bold text-slate-800">{dict.settings.title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Access Code Banner */}
          <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-pink-600 font-bold mb-1 uppercase tracking-wider">{dict.settings.accessCode}</p>
              <div className="flex items-center gap-2 text-slate-800 font-mono text-lg font-bold">
                <KeyRound className="w-5 h-5 text-pink-400" />
                {couple?.access_code}
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-[150px] text-right">{dict.settings.accessCodeHint}</p>
          </div>

          {/* Couple Details Config */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-sm">
            <h3 className="font-serif font-bold text-slate-800">{dict.settings.spaceInfo}</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.startDateLabel}</label>
              {cState && (
                <input 
                  type="date" 
                  value={cState.start_date ? cState.start_date.split('T')[0] : ''} 
                  onChange={e => {
                    const dateVal = e.target.value;
                    if(dateVal) {
                      setCState({...cState, start_date: new Date(dateVal).toISOString()});
                    }
                  }}
                  className="w-full md:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm" 
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Partner 1 */}
            {p1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="relative group cursor-pointer overflow-hidden rounded-full block">
                    <img src={p1.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${p1.name}`} alt={p1.name} className="w-16 h-16 rounded-full border-2 border-pink-200 bg-pink-50 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(1, e)} disabled={isSaving} />
                  </label>
                  <h3 className="font-serif font-bold text-pink-500">{dict.settings.partner1Label}</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.nameLabel}</label>
                  <input value={p1.name} onChange={e => setP1({...p1, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.dobLabel}</label>
                  <input type="date" value={p1.dob ? p1.dob.split('T')[0] : ''} onChange={e => setP1({...p1, dob: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.hobbiesLabel}</label>
                  <input value={p1.hobbies || ''} onChange={e => setP1({...p1, hobbies: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.emailLabel}</label>
                  <input type="email" value={p1.email || ''} onChange={e => setP1({...p1, email: e.target.value})} placeholder="partner1@example.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm" />
                </div>
              </div>
            )}

            {/* Partner 2 */}
            {p2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="relative group cursor-pointer overflow-hidden rounded-full block">
                    <img src={p2.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${p2.name}`} alt={p2.name} className="w-16 h-16 rounded-full border-2 border-rose-200 bg-rose-50 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(2, e)} disabled={isSaving} />
                  </label>
                  <h3 className="font-serif font-bold text-rose-500">{dict.settings.partner2Label}</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.nameLabel}</label>
                  <input value={p2.name} onChange={e => setP2({...p2, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.dobLabel}</label>
                  <input type="date" value={p2.dob ? p2.dob.split('T')[0] : ''} onChange={e => setP2({...p2, dob: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.hobbiesLabel}</label>
                  <input value={p2.hobbies || ''} onChange={e => setP2({...p2, hobbies: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">{dict.settings.emailLabel}</label>
                  <input type="email" value={p2.email || ''} onChange={e => setP2({...p2, email: e.target.value})} placeholder="partner2@example.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 text-sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <button onClick={() => logoutCouple()} className="flex items-center gap-2 px-4 py-2 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            {dict.settings.logoutBtn}
          </button>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
              {dict.settings.cancelBtn}
            </button>
            <button disabled={isSaving} onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white font-bold rounded-xl shadow-md hover:bg-slate-700 transition-colors disabled:opacity-70">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {dict.settings.updateBtn}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
