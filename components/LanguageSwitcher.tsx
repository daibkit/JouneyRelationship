'use client';

import { useI18nStore } from '@/store/useI18nStore';
import { Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18nStore();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full border border-border shadow-sm transition-colors text-sm font-medium"
      title="Switch Language"
    >
      <Languages className="w-4 h-4 text-primary" />
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={locale}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute uppercase"
          >
            {locale}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
}
