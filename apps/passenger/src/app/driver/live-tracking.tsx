import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';
import { locationService } from '../../services/LocationService';
import { liveTrackingRepo } from '../../services/LiveTrackingRepository';

export default function DriverLiveTracking() {
  const router = useRouter();
  const { driver } = useAuthStore();
  const { selectedBus, selectedRoute, activeTrip, setActiveTrip, setSelectedBus, setSelectedRoute } = useDriverStore();
  
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Not started');
  const [trackingActive, setTrackingActive] = useState(false);

  useEffect(() => {
    if (!driver || !selectedBus || !selectedRoute) {
      router.replace('/driver/dashboard');
      return;
    }

    const initTrip = async () => {
      if (!activeTrip) {
        const trip = {
          tripId: `trip_${Date.now()}`,
          driverId: driver.id,
          busId: selectedBus.id,
          routeId: selectedRoute.id,
          startedAt: new Date().toISOString(),
          status: 'LIVE' as const
        };
        setActiveTrip(trip);
        await liveTrackingRepo.startTrip(trip);
      }
      startGpsTracking();
    };

    initTrip();

    return () => {
      // Don't end trip on unmount, but maybe stop GPS if app backgrounds (handled by expo-location background task usually, but here we just keep it foreground for demo)
    };
  }, []);

  const startGpsTracking = async () => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to broadcast live location.');
      return;
    }
    
    setTrackingActive(true);
    await locationService.startTracking(async (loc) => {
      if (isPaused) return;

      const liveLoc = {
        id: `loc_${Date.now()}`,
        busId: selectedBus!.id,
        driverId: driver!.id,
        tripId: activeTrip?.tripId || `trip_${Date.now()}`,
        routeId: selectedRoute!.id,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || 0,
        heading: loc.coords.heading || 0,
        speed: loc.coords.speed || 0,
        timestamp: new Date().toISOString(),
        isOnline: true,
        status: 'LIVE' as const
      };

      await liveTrackingRepo.updateBusLocation(liveLoc);
      setLastUpdated('Just now');
      
      // Update 'Just now' text back to a time after a few seconds, simulated here.
      setTimeout(() => setLastUpdated(new Date().toLocaleTimeString()), 5000);
    });
  };

  const stopGpsTracking = async () => {
    await locationService.stopTracking();
    setTrackingActive(false);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      // Transitioning to paused
      if (selectedBus) {
        liveTrackingRepo.updateBusLocation({
          id: 'pause', busId: selectedBus.id, driverId: driver!.id, tripId: activeTrip!.tripId, routeId: selectedRoute!.id,
          latitude: 0, longitude: 0, accuracy: 0, heading: 0, speed: 0, timestamp: new Date().toISOString(), isOnline: false, status: 'PAUSED'
        });
      }
    } else {
      setLastUpdated('Resuming...');
    }
  };

  const handleEndTrip = () => {
    Alert.alert('End Live Trip?', 'Passengers will no longer see your live location.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Trip', style: 'destructive', onPress: async () => {
          await stopGpsTracking();
          if (selectedBus) {
            await liveTrackingRepo.stopTrip(selectedBus.id);
          }
          setActiveTrip(null);
          setSelectedBus(null);
          setSelectedRoute(null);
          router.replace('/driver/dashboard');
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Trip</Text>
        <View style={[styles.badge, isPaused ? styles.badgePaused : styles.badgeLive]}>
          <Text style={[styles.badgeText, isPaused ? styles.badgeTextPaused : styles.badgeTextLive]}>
            {isPaused ? '● PAUSED' : '● LIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.busInfoCard}>
          <Text style={styles.busNumber}>{selectedBus?.number}</Text>
          <Text style={styles.routeText}>Route {selectedRoute?.routeNumber}</Text>
          <Text style={styles.routeName}>{selectedRoute?.name}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Location Status</Text>
          <Text style={styles.statusValue}>{trackingActive ? (isPaused ? 'Paused' : 'Broadcasting') : 'Waiting for GPS...'}</Text>
          <Text style={styles.statusTime}>Updated: {lastUpdated}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handlePauseToggle}>
            <Text style={styles.btnSecondaryText}>{isPaused ? 'Resume Tracking' : 'Pause Tracking'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnDestructive]} onPress={handleEndTrip}>
            <Text style={styles.btnDestructiveText}>End Trip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#27272A' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeLive: { backgroundColor: '#22C55E20' },
  badgePaused: { backgroundColor: '#F59E0B20' },
  badgeText: { fontWeight: '700', fontSize: 12 },
  badgeTextLive: { color: '#22C55E' },
  badgeTextPaused: { color: '#F59E0B' },

  container: { flex: 1, padding: 20, justifyContent: 'center' },
  
  busInfoCard: { alignItems: 'center', marginBottom: 40 },
  busNumber: { color: '#FFF', fontSize: 48, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  routeText: { color: '#3B82F6', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  routeName: { color: '#A1A1AA', fontSize: 18 },

  statusCard: { backgroundColor: '#1E1E1E', padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#27272A' },
  statusLabel: { color: '#A1A1AA', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  statusValue: { color: '#FFF', fontSize: 24, fontWeight: '600', marginBottom: 4 },
  statusTime: { color: '#71717A', fontSize: 14 },

  controls: { gap: 16 },
  btn: { padding: 20, borderRadius: 16, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#27272A' },
  btnSecondaryText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  btnDestructive: { backgroundColor: '#EF444420', borderWidth: 1, borderColor: '#EF4444' },
  btnDestructiveText: { color: '#EF4444', fontSize: 18, fontWeight: '700' },
});
