import { create } from 'zustand';
import { en } from '@/lib/dictionaries/en';
import { vi } from '@/lib/dictionaries/vi';

type LocaleType = 'en' | 'vi';

interface I18nStore {
  locale: LocaleType;
  dict: typeof en;
  setLocale: (locale: LocaleType) => void;
}

export const useI18nStore = create<I18nStore>((set) => ({
  locale: 'vi', // Default locale
  dict: vi,     // Default dictionary
  setLocale: (locale: LocaleType) => {
    const dict = locale === 'en' ? en : vi;
    set({ locale, dict });
  },
}));
