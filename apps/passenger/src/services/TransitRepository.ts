import { Bus, Route, Stop, Trip } from '../models/types';
import { api } from './api';

export class TransitRepository {
  async searchStops(query: string): Promise<Stop[]> {
    try {
      const response = await api.get('/stops');
      const allStops: Stop[] = response.data;
      if (!query) return allStops;
      const lower = query.toLowerCase();
      return allStops.filter((s: Stop) => s.name.toLowerCase().includes(lower));
    } catch (error) {
      console.error('Failed to search stops:', error);
      return [];
    }
  }

  async getAllStops(): Promise<Stop[]> {
    try {
      const response = await api.get('/stops');
      return response.data;
    } catch (error) {
      console.error('Failed to get all stops:', error);
      return [];
    }
  }

  async getStopById(id: string): Promise<Stop | undefined> {
    try {
      const response = await api.get(`/stops/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get stop ${id}:`, error);
      return undefined;
    }
  }

  async searchRoutes(query: string): Promise<Route[]> {
    try {
      const response = await api.get('/routes');
      
      const mappedRoutes: Route[] = response.data.map((r: any) => ({
        id: r.id,
        routeNumber: r.name || 'RTE',
        name: r.origin ? `${r.origin} - ${r.destination}` : 'Local Route',
        stops: r.stops || [],
        fare: 20,
        estimatedDuration: 45,
        busType: 'Standard',
        isDirect: true
      }));

      if (!query) return mappedRoutes;
      const lower = query.toLowerCase();
      
      return mappedRoutes.filter((r) => 
        r.routeNumber.toLowerCase().includes(lower) || 
        r.name.toLowerCase().includes(lower)
      );
    } catch (error) {
      console.error('Failed to search routes:', error);
      return [];
    }
  }

  async findTrips(originName: string, destinationName: string): Promise<Trip[]> {
    try {
      const response = await api.get('/trips');
      
      return response.data.map((t: any) => ({
        id: t.id,
        origin: originName,
        destination: destinationName,
        route: {
          id: t.route?.id || 'r1',
          routeNumber: t.route?.polyline || '14C', // Fallback to 14C, use polyline hack for dynamic demo routes
          name: t.route?.origin ? `${t.route.origin} to ${t.route.destination}` : 'Local Route',
          stops: t.route?.stops || [],
          fare: 20,
          estimatedDuration: 45, // Mock value
          busType: 'AC',
          isDirect: true
        },
        departure: t.scheduledStart || new Date().toISOString(),
        estimatedArrival: new Date(new Date().getTime() + 45 * 60000).toISOString(),
        fare: 20,
        status: t.status || 'SCHEDULED'
      }));
    } catch (error) {
      console.error('Failed to find trips:', error);
      return [];
    }
  }

  async getBusesOnRoute(routeId: string): Promise<Bus[]> {
    try {
      const response = await api.get('/buses');
      const allBuses: Bus[] = response.data;
      // Filter buses if they are assigned to trips on this route, or just return all for demo
      return allBuses;
    } catch (error) {
      console.error('Failed to get buses:', error);
      return [];
    }
  }

  async getBusById(busId: string): Promise<Bus | undefined> {
    try {
      const response = await api.get(`/buses/${busId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get bus ${busId}:`, error);
      return undefined;
    }
  }
}

export const transitRepo = new TransitRepository();
