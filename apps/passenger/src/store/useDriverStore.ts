import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Bus, Route } from '../models/types';
import { ActiveTrip } from '../models/driverTypes';

interface DriverState {
  selectedBus: Bus | null;
  selectedRoute: Route | null;
  activeTrip: ActiveTrip | null;
  setSelectedBus: (bus: Bus | null) => void;
  setSelectedRoute: (route: Route | null) => void;
  setActiveTrip: (trip: ActiveTrip | null) => void;
}

export const useDriverStore = create<DriverState>()(
  persist(
    (set) => ({
      selectedBus: null,
      selectedRoute: null,
      activeTrip: null,
      setSelectedBus: (bus) => set({ selectedBus: bus }),
      setSelectedRoute: (route) => set({ selectedRoute: route }),
      setActiveTrip: (trip) => set({ activeTrip: trip }),
    }),
    {
      name: 'driver-state-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
