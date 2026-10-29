import { useQuery } from '@tanstack/react-query';
import { transitRepo } from '../services/TransitRepository';
import { Stop, Route, Trip, Bus } from '../models/types';

export function useStops(query: string = '') {
  return useQuery<Stop[]>({
    queryKey: ['stops', query],
    queryFn: () => transitRepo.searchStops(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStop(id: string) {
  return useQuery<Stop | undefined>({
    queryKey: ['stop', id],
    queryFn: () => transitRepo.getStopById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRoutes(query: string = '') {
  return useQuery<Route[]>({
    queryKey: ['routes', query],
    queryFn: () => transitRepo.searchRoutes(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrips(originName: string, destinationName: string) {
  return useQuery<Trip[]>({
    queryKey: ['trips', originName, destinationName],
    queryFn: () => transitRepo.findTrips(originName, destinationName),
    enabled: !!originName && !!destinationName,
    staleTime: 60 * 1000, // 1 minute since trips change often
  });
}

export function useBusesOnRoute(routeId: string) {
  return useQuery<Bus[]>({
    queryKey: ['buses', 'route', routeId],
    queryFn: () => transitRepo.getBusesOnRoute(routeId),
    enabled: !!routeId,
    refetchInterval: 10000, // Refetch every 10 seconds for live feeling
  });
}

export function useBus(id: string) {
  return useQuery<Bus | undefined>({
    queryKey: ['bus', id],
    queryFn: () => transitRepo.getBusById(id),
    enabled: !!id,
  });
}
