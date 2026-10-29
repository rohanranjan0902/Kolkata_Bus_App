export interface Bus {
  id: string;
  number: string; // e.g., 'WB-01-2210'
  routeId: string; // eg . '42A' / '39A' etc 
  type: string;
  isAC: boolean;
  isElectric: boolean;
  status: 'LIVE' | 'SCHEDULED' | 'DELAYED';
  latitude: number;
  longitude: number;
  currentStopId: string;
  nextStopId: string;
  lastUpdated: string; // ISO string
}

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routes: string[]; // routeIds
}

export interface Route {
  id: string;
  routeNumber: string; // e.g., 'AC-12'
  name: string;
  stops: string[]; // Stop IDs in order
  fare: number;
  estimatedDuration: number; // in minutes
  busType: string;
  isDirect: boolean;
}

export interface Trip {
  id: string;
  origin: string; // Stop name or ID
  destination: string; // Stop name or ID
  route: Route;
  departure: string; // ISO string
  estimatedArrival: string; // ISO string
  fare: number;
  status: 'ON_TIME' | 'DELAYED';
}

export interface Settings {
  appearance: 'Dark' | 'Light' | 'System';
  notifications: {
    busArrival: boolean;
    routeAlerts: boolean;
    serviceDisruptions: boolean;
  };
  travelPreferences: {
    preferAC: boolean;
    preferElectric: boolean;
    preferCheapest: boolean;
    preferFastest: boolean;
    avoidTransfers: boolean;
  };
  useCurrentLocation: boolean;
  language: 'English' | 'Bengali';
  refreshInterval: number; // in seconds
}
