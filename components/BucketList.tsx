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
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
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
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fce7f3', '#fbcfe8', '#f472b6', '#fb7185', '#e879f9']
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

  const activeItems = items.filter(item => !item.is_completed);
  const completedItems = items.filter(item => item.is_completed);
  const progressPercent = items.length === 0 ? 0 : Math.round((completedItems.length / items.length) * 100);

  const renderCard = (item: BucketListType) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group p-3.5 rounded-[1rem] border transition-all duration-300 flex flex-col h-full
        ${item.is_completed 
          ? 'bg-slate-50/80 backdrop-blur-sm border-slate-200 shadow-inner' 
          : 'bg-white/80 backdrop-blur-md border-pink-100 shadow-[0_4px_15px_rgb(236,72,153,0.04)] hover:shadow-[0_4px_15px_rgb(236,72,153,0.08)] hover:-translate-y-0.5'
        }`}
    >
      <div className="flex gap-2.5 items-start flex-1">
        <button
          onClick={() => handleToggleComplete(item)}
          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5
            ${item.is_completed 
              ? 'bg-emerald-400 border-emerald-400 text-white shadow-[0_0_10px_rgba(52,211,153,0.3)]' 
              : 'border-slate-300 text-transparent hover:border-pink-400 hover:text-pink-200 bg-white'
            }`}
        >
          <Check className="w-3 h-3" />
        </button>

        <div className="flex-1 w-full">
          <h3 className={`text-base font-serif font-bold leading-tight mb-1 transition-all ${item.is_completed ? 'text-slate-500' : 'text-slate-800'}`}>
            {item.title}
          </h3>
          {item.description && (
            <p className={`text-[12px] leading-relaxed whitespace-pre-wrap ${item.is_completed ? 'text-slate-400' : 'text-slate-600'}`}>
              {item.description}
            </p>
          )}
        </div>
      </div>

      {item.is_completed && item.completed_at && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Đã đạt được
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(item.completed_at).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 backdrop-blur p-1 rounded-full shadow-sm border border-slate-100">
        {!item.is_completed && (
          <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Chỉnh sửa">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="Xóa">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 md:px-0">
      
      <div className="flex flex-col items-center justify-center mb-8 space-y-2">
        <Gift className="w-10 h-10 text-pink-500 mb-1" />
        <h1 className="text-3xl font-serif text-slate-800 font-bold">{dict.bucketList?.title || 'Bucket List'}</h1>
        <p className="text-sm text-slate-500 font-medium max-w-md text-center">{dict.bucketList?.subtitle || 'Our dreams and goals to achieve together'}</p>
        
        <button 
          onClick={openAddModal}
          className="mt-2 bg-pink-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_5px_15px_rgba(251,113,133,0.3)] hover:shadow-[0_8px_20px_rgba(251,113,133,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {dict.bucketList?.addGoalBtn || 'Add Goal'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-500 italic relative z-10 bg-white/50 backdrop-blur-md p-10 rounded-[3rem] border border-white shadow-xl mx-auto max-w-2xl">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-pink-300" />
          </div>
          <p className="text-lg font-medium text-slate-600">Chưa có mục tiêu nào.</p>
          <p className="text-slate-400 mt-1">Hãy cùng nhau tạo nên những kỷ niệm tuyệt vời nhé!</p>
        </div>
      ) : (
        <div className="space-y-6 pb-10">
          <div className="flex flex-col md:flex-row gap-5 w-full items-start">
            {/* Cột Trái: Chưa thực hiện */}
            <div className="flex-1 w-full">
              <div className="sticky top-[90px] z-10 bg-gradient-to-b from-white/90 to-transparent bg-white/50 backdrop-blur shadow-sm p-3 rounded-2xl mb-4">
                <h2 className="text-lg font-serif font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-pink-400 rounded-full inline-block"></span>
                  Chưa thực hiện ({activeItems.length})
                </h2>
              </div>
              
              <div className="flex flex-col gap-3.5">
                {activeItems.length === 0 && (
                  <div className="text-center p-5 border-2 border-dashed border-pink-100 rounded-[1rem] text-sm text-slate-400">
                    Không có mục tiêu nào đang thực hiện
                  </div>
                )}
                <AnimatePresence>
                  {activeItems.map(renderCard)}
                </AnimatePresence>
              </div>
            </div>

            {/* Cột Phải: Đã hoàn thành */}
            <div className="flex-1 w-full">
              <div className="sticky top-[90px] z-10 bg-gradient-to-b from-slate-50/90 to-transparent bg-slate-50/50 backdrop-blur shadow-sm p-3 rounded-2xl mb-4">
                <h2 className="text-lg font-serif font-bold text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-300 rounded-full inline-block"></span>
                  Đã hoàn thành ({completedItems.length})
                </h2>
              </div>
              
              <div className="flex flex-col gap-3.5 opacity-80">
                {completedItems.length === 0 && (
                  <div className="text-center p-5 border-2 border-dashed border-slate-200 rounded-[1rem] text-sm text-slate-400">
                    Chưa có mục tiêu nào hoàn thành
                  </div>
                )}
                <AnimatePresence>
                  {completedItems.map(renderCard)}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all font-medium" placeholder="E.g., Travel to Paris" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none" placeholder="Details about this goal..." />
                </div>

                <div className="pt-4">
                  <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(251,113,133,0.3)] hover:shadow-[0_15px_30px_rgba(251,113,133,0.4)] transition-all disabled:opacity-70 flex justify-center items-center active:scale-95">
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
