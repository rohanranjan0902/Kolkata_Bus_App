import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { secureStorage } from './secureStorage';
import { Driver } from '../models/driverTypes';

interface AuthState {
  driver: Driver | null;
  isAuthenticated: boolean;
  setDriver: (driver: Driver | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      driver: null,
      isAuthenticated: false,
      setDriver: (driver) => set({ driver, isAuthenticated: !!driver }),
      logout: () => set({ driver: null, isAuthenticated: false }),
    }),
    {
      name: 'driver-auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
