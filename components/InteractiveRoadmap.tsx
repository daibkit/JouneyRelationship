'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CalendarHeart, Stars, Plus, Edit2, Trash2, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Milestone } from '@/types/database';
import { getMilestones, addMilestone, updateMilestone, deleteMilestone } from '@/app/actions/milestones';
import { useI18nStore } from '@/store/useI18nStore';

// Icon Map of Moods
const MOOD_ICONS: Record<string, string> = {
  romantic: '💕',
  happy: '😄',
  excited: '✨',
  relaxed: '🌿',
  sad: '😢',
  surprised: '😲',
};

export default function InteractiveRoadmap() {
  const { dict } = useI18nStore();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    mood: 'romantic'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMilestones = async () => {
    setIsLoading(true);
    const res = await getMilestones();
    if (res.data) {
      setMilestones(res.data as Milestone[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', date: new Date().toISOString().split('T')[0], location: '', mood: 'romantic' });
    setIsModalOpen(true);
  };

  const openEditModal = (m: Milestone) => {
    setEditingId(m.id);
    setFormData({
      title: m.title,
      description: m.description || '',
      date: new Date(m.date).toISOString().split('T')[0],
      location: m.location || '',
      mood: m.mood || 'romantic'
    });
    setImageFile(null);
    setImagePreview(m.image_url || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      await deleteMilestone(id);
      setMilestones(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (imageFile) {
      data.append('image', imageFile);
    }

    if (editingId) {
      const res = await updateMilestone(editingId, data);
      if (res.success && res.data) {
        setMilestones(prev => prev.map(m => (m.id === editingId ? res.data as Milestone : m)));
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    } else {
      const res = await addMilestone(data);
      if (res.success && res.data) {
        // Mới nhất lên đầu hoac tự sort lại
        setMilestones(prev => [res.data as Milestone, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 md:px-0 relative">
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-300 via-rose-200 to-pink-100 rounded-full md:-translate-x-1/2 opacity-50" />
      
      {/* Nút Thêm Mới */}
      <div className="flex justify-center mb-12 relative z-10">
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          {dict.roadmap.addMilestoneBtn}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
      ) : milestones.length === 0 ? (
        <div className="text-center text-slate-500 italic relative z-10 bg-white/50 p-6 rounded-2xl mx-10">
          {dict.roadmap.emptyTimeline}
        </div>
      ) : (
        <div className="space-y-12">
          <AnimatePresence>
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className={`relative flex items-center justify-between md:justify-normal group ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-5 h-5 bg-white border-4 border-pink-400 rounded-full md:-translate-x-1/2 z-10 shadow-[0_0_0_4px_rgba(255,192,203,0.3)] group-hover:bg-pink-400 transition-colors" />

                {/* Content card */}
                <div className={`ml-16 md:ml-0 w-full md:w-5/12 p-5 bg-white/80 backdrop-blur-md rounded-3xl border border-pink-100 shadow-sm hover:shadow-md transition-all relative ${
                  index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                }`}>
                  {/* Action box */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => openEditModal(milestone)} className="p-1.5 bg-slate-50 hover:bg-pink-50 text-slate-400 hover:text-pink-500 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(milestone.id)} className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2 pr-12">
                    <span className="text-xs font-bold text-pink-600 px-3 py-1 bg-pink-50 rounded-full flex items-center gap-1">
                      <CalendarHeart className="w-3 h-3" />
                      {new Date(milestone.date).toLocaleDateString()}
                    </span>
                    <span className="text-lg" title={milestone.mood || 'romantic'}>{MOOD_ICONS[milestone.mood || 'romantic'] || '💕'}</span>
                  </div>
                  
                  {milestone.image_url && (
                    <div className="mb-4 rounded-2xl overflow-hidden w-full h-48 sm:h-56">
                      <img src={milestone.image_url} alt={milestone.title} className="w-full h-full object-cover select-none pointer-events-none" />
                    </div>
                  )}
                  
                  <h3 className="text-lg font-serif font-bold text-slate-800 mb-2">{milestone.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap leading-relaxed">
                    {milestone.description}
                  </p>
                  
                  {milestone.location && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <MapPin className="w-3 h-3" />
                      {milestone.location}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-pink-50 border-b border-pink-100 flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
                  <Stars className="w-5 h-5 text-pink-500" />
                  {editingId ? 'Edit Memory' : 'New Memory'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.roadmap.titleLabel}</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all" placeholder={dict.roadmap.titlePlaceholder} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{dict.roadmap.dateLabel}</label>
                    <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{dict.roadmap.locationLabel}</label>
                    <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all" placeholder={dict.roadmap.locationPlaceholder} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{dict.roadmap.descLabel}</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all" placeholder={dict.roadmap.descPlaceholder} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{dict.roadmap.moodLabel}</label>
                  <div className="flex gap-2">
                    {Object.entries(MOOD_ICONS).map(([moodKey, icon]) => (
                      <button
                        key={moodKey}
                        type="button"
                        onClick={() => setFormData({...formData, mood: moodKey})}
                        className={`text-xl p-2 rounded-xl transition-all ${formData.mood === moodKey ? 'bg-pink-100 scale-110 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 grayscale hover:grayscale-0 opacity-50 hover:opacity-100'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{dict.roadmap.imageLabel}</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all overflow-hidden relative">
                    {imagePreview ? (
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6 mb-2 text-pink-400 opacity-70" />
                        <span className="text-sm font-medium text-slate-500">Click to upload photo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }} />
                  </label>
                </div>

                <div className="pt-4">
                  <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-70 flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.roadmap.saveBtn}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
