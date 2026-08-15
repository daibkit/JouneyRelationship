'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useI18nStore } from '@/store/useI18nStore';
import { Heart } from 'lucide-react';
import { getMilestones } from '@/app/actions/milestones';

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function LoveCounter() {
  const { couple } = useCoupleStore();
  const { dict } = useI18nStore();
  const [elapsed, setElapsed] = useState<TimeElapsed>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);
  const [targetDate, setTargetDate] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    let mounted = true;
    
    async function determineStartDate() {
      try {
        const res = await getMilestones();
        if (res.data && res.data.length > 0 && mounted) {
          const oldestMilestone = res.data[res.data.length - 1]; // Sorted DESC by default, so last is oldest
          setTargetDate(oldestMilestone.date);
        } else if (mounted) {
          setTargetDate(couple?.start_date || null);
        }
      } catch (err) {
        if (mounted) setTargetDate(couple?.start_date || null);
      }
    }
    
    determineStartDate();
    
    return () => {
      mounted = false;
    };
  }, [couple?.start_date]);

  useEffect(() => {
    if (!targetDate) return;

    const startDate = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = now - startDate;

      if (difference > 0) {
        setElapsed({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isClient) {
    return <div className="h-40 w-full animate-pulse bg-muted rounded-3xl" />;
  }

  const timeBlocks = [
    { label: dict.loveCounter.days, value: elapsed.days },
    { label: dict.loveCounter.hours, value: elapsed.hours },
    { label: dict.loveCounter.mins, value: elapsed.minutes },
    { label: dict.loveCounter.secs, value: elapsed.seconds },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="glass relative overflow-hidden rounded-[2rem] p-8 shadow-xl border border-white/20 dark:border-white/5"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="bg-primary/20 p-4 rounded-full mb-6"
        >
          <Heart className="w-8 h-8 text-accent fill-accent" />
        </motion.div>

        <h2 className="text-xl md:text-2xl font-serif text-foreground mb-8 text-center bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          {dict.loveCounter.togetherFor}
        </h2>

        <div className="flex justify-center gap-3 md:gap-6 w-full">
          {timeBlocks.map((block, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-card w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shadow-sm border border-border overflow-hidden relative">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={block.value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground absolute"
                  >
                    {block.value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="text-xs md:text-sm font-medium text-muted-foreground mt-3 uppercase tracking-wider">
                {block.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
