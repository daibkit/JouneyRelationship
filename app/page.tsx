'use client';

import { motion } from 'framer-motion';
import LoveCounter from '@/components/LoveCounter';
import DeepTalk from '@/components/DeepTalk';
import MusicToday from '@/components/Sparks/MusicToday';
import MoodTracker from '@/components/Sparks/MoodTracker';
import TimeCapsule from '@/components/Sparks/TimeCapsule';
import LoveCoupons from '@/components/Sparks/LoveCoupons';
import InteractiveRoadmap from '@/components/InteractiveRoadmap';
import BucketList from '@/components/BucketList';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ProfileSettingsModal from '@/components/ProfileSettingsModal';
import { HeartHandshake, Sparkles, Map, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18nStore } from '@/store/useI18nStore';
import { useCoupleStore } from '@/store/useCoupleStore';
import { getCoupleProfile } from '@/app/actions/couple';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { dict } = useI18nStore();
  const router = useRouter();
  
  // Lấy data từ Store
  const { partners, currentUser, partnerUser, setProfile } = useCoupleStore();

  useEffect(() => {
    // Load profile on mount
    const fetchProfile = async () => {
      const res = await getCoupleProfile();
      if (res.error) {
        router.push('/login');
        return;
      }
      if (res.success && res.data) {
        if (!res.data.currentPartnerId) {
          router.push('/select-partner');
          return;
        }
        setProfile(res.data.couple, res.data.partners, res.data.currentPartnerId);
      }
    };
    fetchProfile();
  }, [setProfile, router]);

  const TABS = [
    { id: 'home', label: dict.common.home, icon: HeartHandshake },
    { id: 'sparks', label: dict.common.sparks, icon: Sparkles },
    { id: 'journey', label: dict.common.journey, icon: Map },
    { id: 'bucket', label: dict.common.bucketList, icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50 dark:from-background dark:to-background text-foreground pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky text-foreground top-0 z-50 glass border-b border-border p-4 md:p-6 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <HeartHandshake className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-wide hidden sm:block text-pink-600">
              {dict.home.title}
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 bg-card px-6 py-2 rounded-full border border-pink-100 shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm font-bold transition-all ${
                  activeTab === tab.id ? 'text-pink-500 scale-105' : 'text-slate-400 hover:text-pink-400'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {/* Couple Avatars */}
            <div 
              className="flex -space-x-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setIsSettingsOpen(true)}
              title="Couple Settings"
            >
              {currentUser ? (
                <img src={currentUser.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${currentUser.name}`} className="w-10 h-10 rounded-full border-2 border-background z-10 shadow-sm object-cover bg-pink-50" alt="Current User" />
              ) : <div className="w-10 h-10 rounded-full border-2 border-background z-10 shadow-sm bg-slate-200" />}
              
              {partnerUser ? (
                <img src={partnerUser.avatar_url || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${partnerUser.name}`} className="w-10 h-10 rounded-full border-2 border-background shadow-sm object-cover bg-rose-50" alt="Partner" />
              ) : <div className="w-10 h-10 rounded-full border-2 border-background bg-slate-200" />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-4 md:p-8 mt-6">
        <div className={activeTab === 'home' ? 'block w-full' : 'fixed top-[-9999px] left-[-9999px] w-0 h-0 overflow-hidden opacity-0 pointer-events-none'}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 w-full"
          >
            <section>
              <LoveCounter />
            </section>

            <div className="flex flex-col md:grid md:grid-cols-12 gap-6 w-full">
              {/* Music Player */}
              <div className="md:col-span-8 min-h-[300px]">
                <MusicToday />
              </div>
              
              {/* Mood Tracker */}
              <div className="md:col-span-4 min-h-[300px]">
                <MoodTracker />
              </div>
            </div>
          </motion.div>
        </div>

        {activeTab === 'sparks' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <Sparkles className="w-12 h-12 text-pink-500 mx-auto" />
              <h1 className="text-4xl font-serif text-slate-800 font-bold">{dict.sparks.title}</h1>
              <p className="text-slate-500 font-medium">{dict.sparks.subtitle}</p>
            </div>
            
            <div className="flex flex-col md:grid md:grid-cols-12 gap-6 mt-10 max-w-5xl mx-auto w-full">

              {/* Deep Talk (Cards) */}
              <div className="md:col-span-6 min-h-[350px]">
                <DeepTalk />
              </div>

              {/* Time Capsule and Coupons small grid */}
              <div className="md:col-span-6 flex flex-col md:grid md:grid-cols-2 gap-6">
                <div className="min-h-[200px] h-full w-full">
                  <TimeCapsule />
                </div>
                <div className="min-h-[200px] h-full w-full">
                  <LoveCoupons />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'journey' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-4">
              <Map className="w-12 h-12 text-pink-500 mx-auto" />
              <h1 className="text-4xl font-serif text-slate-800 font-bold">{dict.journey.title}</h1>
              <p className="text-slate-500 font-medium">{dict.journey.subtitle}</p>
            </div>
            <InteractiveRoadmap />
          </motion.div>
        )}
        
        {activeTab === 'bucket' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BucketList />
          </motion.div>
        )}
      </main>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full glass border-t border-pink-100 z-50 px-6 py-4 flex justify-between items-center bg-white/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id ? 'text-pink-500' : 'text-slate-400'
            }`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'scale-110 shadow-sm' : ''} transition-transform`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
