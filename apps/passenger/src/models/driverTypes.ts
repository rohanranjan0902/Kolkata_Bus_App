export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  driverId: string;
}
export interface LiveBusLocation {
  id: string;
  busId: string;
  driverId: string;
  tripId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number;
  speed: number;
  timestamp: string; // ISO string
  isOnline: boolean;
  status: 'LIVE' | 'PAUSED' | 'ENDED';
}
export interface ActiveTrip {
  tripId: string;
  driverId: string;
  busId: string;
  routeId: string;
  startedAt: string;
  status: 'LIVE' | 'PAUSED' | 'ENDED';
}
