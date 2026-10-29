import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../models/types';

interface SearchHistoryItem {
  id: string;
  origin: string;
  destination: string;
  timestamp: string;
}

interface AppState {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  
  favorites: string[]; // route or stop IDs
  toggleFavorite: (id: string) => void;
  
  recentSearches: SearchHistoryItem[];
  addRecentSearch: (origin: string, destination: string) => void;
  clearRecentSearches: () => void;
}

const defaultSettings: Settings = {
  appearance: 'System',
  notifications: {
    busArrival: true,
    routeAlerts: true,
    serviceDisruptions: true,
  },
  travelPreferences: {
    preferAC: false,
    preferElectric: false,
    preferCheapest: false,
    preferFastest: true,
    avoidTransfers: false,
  },
  useCurrentLocation: true,
  language: 'English',
  refreshInterval: 30,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      favorites: [],
      
      toggleFavorite: (id) => set((state) => {
        const exists = state.favorites.includes(id);
        if (exists) {
          return { favorites: state.favorites.filter(f => f !== id) };
        } else {
          return { favorites: [...state.favorites, id] };
        }
      }),

      recentSearches: [],
      
      addRecentSearch: (origin, destination) => set((state) => {
        const newItem: SearchHistoryItem = {
          id: Date.now().toString(),
          origin,
          destination,
          timestamp: new Date().toISOString()
        };
        // Keep last 10
        const newHistory = [newItem, ...state.recentSearches.filter(i => !(i.origin === origin && i.destination === destination))].slice(0, 10);
        return { recentSearches: newHistory };
      }),

      clearRecentSearches: () => set({ recentSearches: [] })
    }),
    {
      name: 'kolkata-bus-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
