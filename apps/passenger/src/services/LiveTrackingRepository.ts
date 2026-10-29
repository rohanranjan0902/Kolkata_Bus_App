import { LiveBusLocation, ActiveTrip } from '../models/driverTypes';
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

type LocationSubscriber = (loc: LiveBusLocation) => void;

export class LiveTrackingRepository {
  private socket: Socket;
  private subscribers = new Map<string, LocationSubscriber[]>();
  private latestLocations = new Map<string, LiveBusLocation>();

  constructor() {
    this.socket = io(getBaseUrl(), {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Live Tracking WebSocket');
      // Rejoin rooms on reconnect
      for (const busId of this.subscribers.keys()) {
        this.socket.emit('room.join', { room: `bus:${busId}` });
      }
    });

    this.socket.on('bus.location.updated', (location: LiveBusLocation) => {
      this.latestLocations.set(location.busId, location);
      const subs = this.subscribers.get(location.busId) || [];
      subs.forEach(cb => cb(location));
    });
  }

  async startTrip(trip: ActiveTrip): Promise<void> {
    // This would typically hit a REST endpoint or emit a socket event to mark the trip as started
    console.log('Started trip:', trip);
  }

  async stopTrip(busId: string): Promise<void> {
    // This would typically hit a REST endpoint to mark the trip as ended
    console.log('Stopped trip for bus:', busId);
    this.latestLocations.delete(busId);
  }

  async updateBusLocation(location: LiveBusLocation): Promise<void> {
    // If the passenger app also acts as the driver app for testing, emit the update
    this.socket.emit('driver.location.update', location);
  }

  async getLiveBusLocation(busId: string): Promise<LiveBusLocation | null> {
    return this.latestLocations.get(busId) || null;
  }

  subscribeToBusLocation(busId: string, callback: LocationSubscriber): () => void {
    const subs = this.subscribers.get(busId) || [];
    const isFirstSub = subs.length === 0;
    
    subs.push(callback);
    this.subscribers.set(busId, subs);

    if (isFirstSub) {
      this.socket.emit('room.join', { room: `bus:${busId}` });
    }

    // Initial emit if we already have a location
    const loc = this.latestLocations.get(busId);
    if (loc) {
      callback(loc);
    }

    return () => {
      let currentSubs = this.subscribers.get(busId) || [];
      currentSubs = currentSubs.filter(cb => cb !== callback);
      
      if (currentSubs.length === 0) {
        this.subscribers.delete(busId);
        // Note: We could emit a room.leave event here if the backend supported it
      } else {
        this.subscribers.set(busId, currentSubs);
      }
    };
  }
}

export const liveTrackingRepo = new LiveTrackingRepository();
