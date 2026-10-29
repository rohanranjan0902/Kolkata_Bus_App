import { Bus, Route, Stop } from '../models/types';
import { transitRepo } from './TransitRepository';

type Subscriber = (bus: Bus) => void;

export class LiveTrackingSimulator {
  private activeBuses: Map<string, Bus> = new Map();
  private subscribers: Map<string, Subscriber[]> = new Map();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();

  async startTracking(busId: string): Promise<void> {
    if (this.timers.has(busId)) return; // Already tracking

    const bus = await transitRepo.getBusById(busId);
    if (!bus) return;

    this.activeBuses.set(busId, { ...bus });
    
    // Simulate movement every 10 seconds
    const timer = setInterval(() => this.simulateMovement(busId), 10000);
    this.timers.set(busId, timer);
  }

  stopTracking(busId: string): void {
    const timer = this.timers.get(busId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(busId);
    }
    this.subscribers.delete(busId);
  }

  subscribe(busId: string, callback: Subscriber): void {
    const subs = this.subscribers.get(busId) || [];
    subs.push(callback);
    this.subscribers.set(busId, subs);

    // Initial emit
    const bus = this.activeBuses.get(busId);
    if (bus) {
      callback(bus);
    } else {
      this.startTracking(busId).then(() => {
        const startedBus = this.activeBuses.get(busId);
        if (startedBus) callback(startedBus);
      });
    }
  }

  unsubscribe(busId: string, callback: Subscriber): void {
    let subs = this.subscribers.get(busId) || [];
    subs = subs.filter(cb => cb !== callback);
    this.subscribers.set(busId, subs);

    if (subs.length === 0) {
      this.stopTracking(busId);
    }
  }

  private async simulateMovement(busId: string) {
    const bus = this.activeBuses.get(busId);
    if (!bus) return;

    const routes = await transitRepo.searchRoutes('');
    const route = routes.find(r => r.id === bus.routeId);
    if (!route) return;

    // Very simple simulation: just advance the stop every few ticks.
    // For a more realistic one, we'd adjust latitude/longitude and ETAs.
    const currentIndex = route.stops.indexOf(bus.currentStopId);
    const nextIndex = route.stops.indexOf(bus.nextStopId);
    
    if (nextIndex !== -1 && nextIndex < route.stops.length) {
      // randomly move to next stop
      if (Math.random() > 0.5) {
        bus.currentStopId = route.stops[nextIndex];
        if (nextIndex + 1 < route.stops.length) {
          bus.nextStopId = route.stops[nextIndex + 1];
        } else {
          bus.nextStopId = '';
          bus.status = 'SCHEDULED'; // Reached dest
        }
      }
    }

    bus.lastUpdated = new Date().toISOString();
    
    // Notify subscribers
    const subs = this.subscribers.get(busId) || [];
    subs.forEach(cb => cb({ ...bus }));
  }
}

export const liveTrackingSimulator = new LiveTrackingSimulator();
