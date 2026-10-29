import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { transitRepo } from '../services/TransitRepository';
import { liveTrackingRepo } from '../services/LiveTrackingRepository';
import { Trip, Bus } from '../models/types';
import { LiveBusLocation } from '../models/driverTypes';
import { useAppStore } from '../store/useAppStore';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const origin = (params.origin as string) || 'Esplanade';
  const destination = (params.destination as string) || 'Howrah Station';
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveLocations, setLiveLocations] = useState<Record<string, LiveBusLocation>>({});
  const { toggleFavorite, favorites } = useAppStore();

  // Filters State
  const [sortBy, setSortBy] = useState<'shortest' | 'cheapest'>('shortest');
  const [filterDirect, setFilterDirect] = useState(false);
  const [filterAC, setFilterAC] = useState(false);
  const [filterElectric, setFilterElectric] = useState(false);

  useEffect(() => {
    let active = true;
    const loadTrips = async () => {
      setLoading(true);
      const data = await transitRepo.findTrips(origin, destination);
      if (active) {
        setTrips(data);
        setLoading(false);

        // Subscribe to live tracking for each route
        const unsubscribes: (() => void)[] = [];
        for (const trip of data) {
          const buses = await transitRepo.getBusesOnRoute(trip.route.id);
          for (const bus of buses) {
            const unsub = liveTrackingRepo.subscribeToBusLocation(bus.id, (loc) => {
              if (active) {
                setLiveLocations(prev => ({...prev, [trip.route.id]: loc}));
              }
            });
            unsubscribes.push(unsub);
          }
        }
        return () => {
          active = false;
          unsubscribes.forEach(u => u());
        };
      }
    };
    loadTrips();
    return () => { active = false; };
  }, [origin, destination]);

  const handleTripClick = async (trip: Trip) => {
    const buses = await transitRepo.getBusesOnRoute(trip.route.id);
    const busId = buses.length > 0 ? buses[0].id : 'b1'; 
    router.push({
      pathname: '/tracking',
      params: { tripId: trip.id, busId, routeId: trip.route.id }
    });
  };

  // Apply Filters & Sorting
  let displayedTrips = [...trips];
  if (filterDirect) displayedTrips = displayedTrips.filter(t => t.route.isDirect);
  if (filterAC) displayedTrips = displayedTrips.filter(t => t.route.busType === 'AC' || t.route.busType === 'Volvo');
  if (filterElectric) displayedTrips = displayedTrips.filter(t => t.route.busType === 'Electric');
  
  displayedTrips.sort((a, b) => {
    if (sortBy === 'cheapest') return a.fare - b.fare;
    return a.route.estimatedDuration - b.route.estimatedDuration;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Buses</Text>
        <TouchableOpacity><Text style={styles.iconText}>🎤</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.routeSummaryCard}>
          <View style={styles.timelineGraphic}>
            <View style={styles.dotBlue} />
            <View style={styles.lineVertical} />
            <Text style={styles.pinIcon}>📍</Text>
          </View>
          <View style={styles.routeTextCol}>
            <Text style={styles.routeLabel}>FROM</Text>
            <Text style={styles.routeVal}>{origin}</Text>
            <View style={styles.spacer} />
            <Text style={styles.routeLabel}>TO</Text>
            <Text style={styles.routeVal}>{destination}</Text>
          </View>
          <TouchableOpacity style={styles.swapBtnContainer} onPress={() => router.push({ pathname: '/results', params: { origin: destination, destination: origin } })}>
            <Text style={styles.swapIcon}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, sortBy === 'shortest' && styles.filterChipActive]}
            onPress={() => setSortBy(sortBy === 'shortest' ? 'cheapest' : 'shortest')}
          >
            <Text style={[styles.filterText, sortBy === 'shortest' && styles.filterTextActive]}>≡ Shortest first</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, sortBy === 'cheapest' && styles.filterChipActive]}
            onPress={() => setSortBy(sortBy === 'cheapest' ? 'shortest' : 'cheapest')}
          >
            <Text style={[styles.filterText, sortBy === 'cheapest' && styles.filterTextActive]}>Cheapest</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filterDirect && styles.filterChipActive]}
            onPress={() => setFilterDirect(!filterDirect)}
          >
            <Text style={[styles.filterText, filterDirect && styles.filterTextActive]}>Direct only</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filterAC && styles.filterChipActive]}
            onPress={() => setFilterAC(!filterAC)}
          >
            <Text style={[styles.filterText, filterAC && styles.filterTextActive]}>AC Buses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, filterElectric && styles.filterChipActive]}
            onPress={() => setFilterElectric(!filterElectric)}
          >
            <Text style={[styles.filterText, filterElectric && styles.filterTextActive]}>Electric</Text>
          </TouchableOpacity>
        </ScrollView>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#81A5FF" />
            <Text style={{ color: '#A1A1AA', marginTop: 16 }}>Finding buses...</Text>
          </View>
        ) : displayedTrips.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🚌</Text>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>No buses found.</Text>
            <Text style={{ color: '#A1A1AA', marginTop: 8, textAlign: 'center' }}>Try relaxing your filters or allow transfers.</Text>
          </View>
        ) : (
          displayedTrips.map((trip, idx) => {
            const liveLoc = liveLocations[trip.route.id];
            const isLive = liveLoc && liveLoc.status === 'LIVE' && liveLoc.isOnline;
            const departureTime = new Date(trip.departure);
            const now = new Date();
            const diffMs = departureTime.getTime() - now.getTime();
            const arrivalMins = Math.max(1, Math.round(diffMs / 60000));
            const isFav = favorites.includes(trip.route.id);

            return (
              <TouchableOpacity key={trip.id} style={styles.resultCard} onPress={() => handleTripClick(trip)}>
                <View style={styles.rcHeader}>
                  <View style={styles.rcTags}>
                    <View style={[styles.rcBadge, {backgroundColor: '#3B82F6'}]}><Text style={styles.rcBadgeText}>Route {trip.route.routeNumber}</Text></View>
                    {isLive ? <Text style={styles.rcLive}>● LIVE</Text> : <Text style={[styles.rcLive, {color: '#A1A1AA'}]}>Scheduled</Text>}
                  </View>
                  <View style={styles.rcRightHeader}>
                    <Text style={styles.rcTotalTime}>{trip.route.estimatedDuration} mins</Text>
                    <Text style={styles.rcTotalLabel}>Total duration</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.rcMainText}>Arriving in {arrivalMins} mins</Text>
                  <TouchableOpacity onPress={() => toggleFavorite(trip.route.id)}>
                    <Text style={{ fontSize: 24, color: isFav ? '#FBBF24' : '#A1A1AA' }}>{isFav ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.rcFooter}>
                  <Text style={styles.rcFooterText}>{trip.route.busType} • {trip.route.isDirect ? 'Direct' : '1 Change'}</Text>
                  <Text style={styles.rcPrice}>₹{trip.fare.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Alert Card */}
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>Potential congestion detected near Howrah Bridge. Expect 5-8 min delays on all routes.</Text>
        </View>

        <View style={{height: 100}} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 20 : 10 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  iconText: { fontSize: 24, color: '#A1A1AA' },
  backBtn: { paddingRight: 20 },

  routeSummaryCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#27272A' },
  timelineGraphic: { alignItems: 'center', marginRight: 16, paddingTop: 6 },
  dotBlue: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#81A5FF', marginBottom: 4 },
  lineVertical: { width: 2, height: 30, backgroundColor: '#3F3F46', marginBottom: 4 },
  pinIcon: { fontSize: 12 },
  
  routeTextCol: { flex: 1, justifyContent: 'space-between' },
  routeLabel: { color: '#71717A', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  routeVal: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  spacer: { height: 12 },
  swapBtnContainer: { justifyContent: 'center' },
  swapIcon: { color: '#81A5FF', fontSize: 20 },

  filtersContainer: { flexDirection: 'row', marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#27272A', marginRight: 10, height: 42, justifyContent: 'center' },
  filterChipActive: { backgroundColor: '#81A5FF', borderColor: '#81A5FF' },
  filterText: { color: '#A1A1AA', fontSize: 14, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  filterTextActive: { color: '#121212', fontWeight: '700' },

  resultCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#27272A' },
  rcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  rcTags: { flexDirection: 'row', alignItems: 'center' },
  rcBadge: { backgroundColor: '#3F3F46', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 },
  rcBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  rcLive: { color: '#22C55E', fontSize: 13, fontWeight: '700' },
  rcRightHeader: { alignItems: 'flex-end' },
  rcTotalTime: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  rcTotalLabel: { color: '#A1A1AA', fontSize: 11, marginTop: 2 },
  
  rcMainText: { color: '#81A5FF', fontSize: 22, fontWeight: '700', marginBottom: 16 },
  
  rcFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#27272A', paddingTop: 12 },
  rcFooterText: { color: '#D4D4D8', fontSize: 14, fontWeight: '500' },
  rcPrice: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  alertCard: { flexDirection: 'row', backgroundColor: 'rgba(249, 115, 22, 0.1)', borderRadius: 12, padding: 16, marginTop: 10, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.4)' },
  alertIcon: { fontSize: 20, marginRight: 12 },
  alertText: { flex: 1, color: '#F97316', fontSize: 13, lineHeight: 20, fontWeight: '500' }
});
