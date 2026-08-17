import { create } from 'zustand';

export interface Partner {
  id: string;
  couple_id: string;
  name: string;
  dob: string | null;
  hobbies: string | null;
  avatar_url: string | null;
  email: string | null;
}

export interface Couple {
  id: string;
  access_code: string;
  start_date: string;
}

interface CoupleStore {
  couple: Couple | null;
  partners: Partner[];
  currentPartnerId: string | null;
  currentUser: Partner | null;
  partnerUser: Partner | null;
  setProfile: (couple: Couple | null, partners: Partner[], currentPartnerId?: string | null) => void;
  updatePartnerInStore: (partner: Partner) => void;
  updateCoupleInStore: (couple: Couple) => void;
}

export const useCoupleStore = create<CoupleStore>((set) => ({
  couple: null,
  partners: [],
  currentPartnerId: null,
  currentUser: null,
  partnerUser: null,
  setProfile: (couple, partners, currentPartnerId) => {
    let currentUser = null;
    let partnerUser = null;
    if (currentPartnerId) {
      currentUser = partners.find(p => p.id === currentPartnerId) || null;
      partnerUser = partners.find(p => p.id !== currentPartnerId) || null;
    }
    set({ couple, partners, currentPartnerId, currentUser, partnerUser });
  },
  updatePartnerInStore: (updatedPartner) => set((state) => {
    const newPartners = state.partners.map(p => p.id === updatedPartner.id ? updatedPartner : p);
    let currentUser = state.currentUser;
    let partnerUser = state.partnerUser;
    if (currentUser?.id === updatedPartner.id) currentUser = updatedPartner;
    if (partnerUser?.id === updatedPartner.id) partnerUser = updatedPartner;
    return { partners: newPartners, currentUser, partnerUser };
  }),
  updateCoupleInStore: (updatedCouple) => set({ couple: updatedCouple })
}));
