'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Loader2, Gift } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { BucketList as BucketListType } from '@/types/database';
import { getBucketList, addBucketItem, updateBucketItem, deleteBucketItem, toggleBucketItemStatus } from '@/app/actions/bucketlist';
import confetti from 'canvas-confetti';

export default function BucketList() {
  const { dict } = useI18nStore();
  const [items, setItems] = useState<BucketListType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const fetchItems = async () => {
    setIsLoading(true);
    const res = await getBucketList();
    if (res.data) {
      setItems(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: BucketListType) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await deleteBucketItem(id);
      setItems(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleToggleComplete = async (item: BucketListType) => {
    const newStatus = !item.is_completed;
    const res = await toggleBucketItemStatus(item.id, newStatus);
    if (res.success && res.data) {
      setItems(prev => prev.map(m => (m.id === item.id ? res.data as BucketListType : m)));
      if (newStatus) {
        // Trigger confetti effect when completing
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);

    if (editingId) {
      const res = await updateBucketItem(editingId, data);
      if (res.success && res.data) {
        setItems(prev => prev.map(m => (m.id === editingId ? res.data as BucketListType : m)));
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    } else {
      const res = await addBucketItem(data);
      if (res.success && res.data) {
        setItems(prev => [res.data as BucketListType, ...prev]);
        setIsModalOpen(false);
      } else {
        alert(res.error);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 md:px-0">
      
      {/* Nút Thêm Mới & Tiêu đề chung */}
      <div className="flex flex-col items-center justify-center mb-12 space-y-4">
        <Gift className="w-16 h-16 text-pink-500 mb-2" />
        <h1 className="text-4xl font-serif text-slate-800 font-bold">{dict.bucketList?.title || 'Bucket List'}</h1>
        <p className="text-slate-500 font-medium max-w-md text-center">{dict.bucketList?.subtitle || 'Our dreams and goals to achieve together'}</p>
        
        <button 
          onClick={openAddModal}
          className="mt-4 bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-[0_10px_20px_rgba(251,113,133,0.3)] hover:shadow-[0_15px_30px_rgba(251,113,133,0.4)] hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {dict.bucketList?.addGoalBtn || 'Add Goal'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-500 italic relative z-10 bg-white/50 p-6 rounded-2xl mx-10">
          Chưa có mục tiêu nào. Hãy thảo luận cùng nhau nhé!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`relative group p-6 rounded-[2rem] border transition-all shadow-sm hover:shadow-md flex items-start gap-4 
                  ${item.is_completed 
                    ? 'bg-slate-50 border-slate-200 opacity-60 grayscale hover:grayscale-0' 
                    : 'bg-white border-pink-100'
                  }`}
              >
                {/* Custom Checkbox */}
                <button
                  onClick={() => handleToggleComplete(item)}
                  className={`mt-1 shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                    ${item.is_completed 
                      ? 'bg-pink-500 border-pink-500 text-white' 
                      : 'border-slate-300 text-transparent hover:border-pink-300 hover:text-pink-100'
                    }`}
                >
                  <Check className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <h3 className={`text-xl font-serif font-bold mb-2 transition-all ${item.is_completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.is_completed && item.completed_at && (
                    <p className="text-xs text-pink-500 font-medium mt-3 bg-pink-50 inline-block px-3 py-1 rounded-full">
                      Completed: {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Buttons */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white shadow-sm border border-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                  <Gift className="w-5 h-5 text-pink-500" />
                  {editingId ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all" placeholder="E.g., Travel into space" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none" placeholder="Details about this goal..." />
                </div>

                <div className="pt-4">
                  <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-70 flex justify-center items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Goal'}
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
