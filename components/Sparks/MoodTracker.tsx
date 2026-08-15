'use client';

import { useState, useEffect } from 'react';
import { Frown, Meh, Smile, Heart, Loader2, Edit3, Check } from 'lucide-react';
import { getDailyMoods, upsertDailyMood } from '@/app/actions/sparks';
import { useCoupleStore, Partner } from '@/store/useCoupleStore';
import { DailyMood } from '@/types/database';
import { useI18nStore } from '@/store/useI18nStore';

const MOODS = [
  { id: 'sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100', hover: 'hover:bg-blue-200' },
  { id: 'tired', icon: Meh, color: 'text-slate-500', bg: 'bg-slate-200', hover: 'hover:bg-slate-300' },
  { id: 'happy', icon: Smile, color: 'text-orange-500', bg: 'bg-orange-100', hover: 'hover:bg-orange-200' },
  { id: 'romantic', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-100', hover: 'hover:bg-pink-200' },
];

export default function MoodTracker() {
  const { partners, currentUser } = useCoupleStore();
  const { dict } = useI18nStore();
  const [moods, setMoods] = useState<DailyMood[]>([]);
  const [loading, setLoading] = useState(true);

  // States for the inline editors
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [tempMoodId, setTempMoodId] = useState<string>('happy');
  const [tempNote, setTempNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Use local date string (YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD

  useEffect(() => {
    async function loadMoods() {
      const res = await getDailyMoods(todayStr);
      if (res.data) setMoods(res.data);
      setLoading(false);
    }
    if (partners && partners.length > 0) {
      loadMoods();
    }
  }, [todayStr, partners]);

  const handleSaveMood = async (partnerId: string) => {
    if (!tempMoodId) return;
    setIsUpdating(true);
    const res = await upsertDailyMood(partnerId, todayStr, tempMoodId, tempNote);
    if (res.success && res.data) {
      setMoods(prev => {
        const updated = prev.filter(m => m.partner_id !== partnerId);
        return [...updated, res.data as DailyMood];
      });
      setEditingPartnerId(null);
    }
    setIsUpdating(false);
  };

  const startEditing = (partner: Partner, existingMood?: DailyMood) => {
    setEditingPartnerId(partner.id);
    setTempMoodId(existingMood ? existingMood.mood : 'happy');
    setTempNote(existingMood && existingMood.note ? existingMood.note : '');
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-100">
        <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-pink-50 p-5 shadow-sm flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">{dict.moodTracker.title}</h2>
        <p className="text-xs text-slate-500">{dict.moodTracker.subtitle}</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {partners.map(partner => {
          const partnerMood = moods.find(m => m.partner_id === partner.id);
          const MoodConfig = partnerMood ? MOODS.find(m => m.id === partnerMood.mood) : null;
          const Icon = MoodConfig?.icon || Meh;
          const isEditing = editingPartnerId === partner.id;

          return (
            <div key={partner.id} className="bg-white/70 rounded-[1.5rem] p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
              {/* Partner Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <img src={partner.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${partner.name}`} className="w-8 h-8 rounded-full border border-pink-100 bg-pink-50" alt="" />
                  <span className="font-bold text-slate-700 text-sm">{partner.name}</span>
                </div>
                {!isEditing && currentUser?.id === partner.id && (
                  <button onClick={() => startEditing(partner, partnerMood)} className="text-slate-400 hover:text-pink-500 bg-white p-1.5 rounded-full shadow-sm transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between gap-1">
                    {MOODS.map(mood => (
                      <button
                        key={mood.id}
                        onClick={() => setTempMoodId(mood.id)}
                        className={`flex-1 flex justify-center items-center py-2 rounded-xl transition-all ${mood.bg} ${mood.hover} ${tempMoodId === mood.id ? 'ring-2 ring-offset-1 ring-slate-300 scale-105 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                      >
                        <mood.icon className={`w-5 h-5 ${mood.color}`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                      placeholder={dict.moodTracker.notePlaceholder}
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      maxLength={60}
                    />
                    <button 
                      disabled={isUpdating}
                      onClick={() => handleSaveMood(partner.id)}
                      className="bg-emerald-500 text-white p-2 flex items-center justify-center rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : partnerMood ? (
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${MoodConfig?.bg} flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                    <Icon className={`w-6 h-6 ${MoodConfig?.color}`} fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div>
                    {partnerMood.note && <p className="text-sm font-medium text-slate-700 italic">"{partnerMood.note}"</p>}
                    {!partnerMood.note && <p className="text-xs font-semibold text-slate-400">{dict.moodTracker.noNote}</p>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-dashed border-slate-300">
                    <Meh className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-400">{dict.moodTracker.notUpdated}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
