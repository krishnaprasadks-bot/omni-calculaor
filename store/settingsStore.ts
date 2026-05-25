import { create } from 'zustand';

interface SettingsState {
  historyOpen: boolean;
  toggleHistory: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  historyOpen: false,
  toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
}));
