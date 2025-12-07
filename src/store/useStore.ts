import { create } from 'zustand';
import { Tag } from '../database/types';

interface Store {
  activeTag: Partial<Tag> | null;
  setActiveTag: (tag: Partial<Tag> | null) => void;
}

export const useStore = create<Store>(set => ({
  activeTag: null,
  setActiveTag: tag => set({ activeTag: tag }),
}));
