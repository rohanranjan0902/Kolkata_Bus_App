import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { liveTrackingRepo } from '../services/LiveTrackingRepository';
import { Stop } from '../models/types';
import { LiveBusLocation } from '../models/driverTypes';
import { useBus, useRoutes, useStops } from '../hooks/useTransit';
import { getDistance, estimateTimeInMinutes } from '../utils/distance';
import { api } from '../services/api';

export default function TrackingScreen() {
  const router = useRouter();
  const { busId, tripId, routeId } = useLocalSearchParams<{ busId: string, tripId: string, routeId: string }>();
  
  const { data: bus, isLoading: isLoadingBus } = useBus(busId);
  const { data: routes, isLoading: isLoadingRoutes } = useRoutes();
  const { data: allStops, isLoading: isLoadingStops } = useStops();
  
  const [liveLocation, setLiveLocation] = useState<LiveBusLocation | null>(null);

  const matchedRoute = useMemo(() => {
    if (!routes) return null;
    return routes.find(r => r.id === routeId) || null;
  }, [routes, routeId]);

  const stops = useMemo(() => {
    if (!matchedRoute || !allStops) return [];
    return matchedRoute.stops.map(s => {
      if (typeof s === 'object') return s as unknown as Stop;
      return allStops.find(as => as.id === s);
    }).filter(Boolean) as Stop[];
  }, [matchedRoute, allStops]);

  useEffect(() => {
    let active = true;
    api.post('/simulator/start', { busId, tripId }).catch(console.error);
    const unsubscribe = liveTrackingRepo.subscribeToBusLocation(busId, (loc) => {
      if (active) setLiveLocation(loc);
    });
    return () => {
      active = false;
      unsubscribe();
      api.post('/simulator/stop', { busId }).catch(console.error);
    };
  }, [busId, tripId]);

  const currentStopIndex = useMemo(() => {
    if (!liveLocation || stops.length === 0) return 0;
    let minDistance = Infinity;
    let closestIndex = 0;
    stops.forEach((stop, index) => {
      const dist = getDistance(liveLocation.latitude, liveLocation.longitude, stop.latitude, stop.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = index;
      }
    });
    // If the closest stop is behind the bus, we might want to return closestIndex + 1. 
    // For the UI, we'll assume closestIndex is the NEXT stop the bus is heading towards.
    // If closestIndex is 0, we'll force it to 1 so the bus is always "between" 0 and 1 at the start.
    return Math.max(1, closestIndex);
  }, [liveLocation, stops]);

  if (isLoadingBus || isLoadingRoutes || !matchedRoute) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}><ActivityIndicator color="#22C55E" size="large" /></View>
      </SafeAreaView>
    );
  }

  const departedTime = "10:15 AM"; // Mocked departed time

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerRouteName}>{matchedRoute.routeNumber}</Text>
            <View style={styles.liveTagContainer}>
              <Text style={styles.liveTagText}>● LIVE TRACKING</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.busNoLabel}>BUS NO.</Text>
            <Text style={styles.busNoValue}>{bus?.registrationNumber || busId}</Text>
          </View>
        </View>

        {/* TITLE BLOCK */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleBold}>{matchedRoute.name}</Text>
          {stops.length > 1 && (
            <Text style={styles.titleSub}>{stops[0].name} → {stops[stops.length - 1].name}</Text>
          )}
        </View>

        {/* STATUS CARD */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>DEPARTED</Text>
            <Text style={styles.statusValue}>{departedTime}</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusRight}>
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <Text style={styles.statusLive}>● LIVE</Text>
            </View>
            <Text style={styles.statusNextStop}>Next Stop: {stops[currentStopIndex]?.name || 'Destination'}</Text>
          </View>
        </View>

        {/* TIMELINE */}
        <ScrollView style={styles.timelineScroll} contentContainerStyle={styles.timelineContent}>
          {stops.map((stop, index) => {
            const isPassed = index < currentStopIndex;
            const isNext = index === currentStopIndex;
            const isDestination = index === stops.length - 1;
            const showBusAfterThisStop = index === currentStopIndex - 1;

            let leftTime = "10:20 AM"; // Mocked default
            if (isPassed) leftTime = index === 0 ? "Passed" : "10:20 AM"; // Just mocking for UI perfection
            
            // ETA Calculation
            let minutesAway = 0;
            if (liveLocation && !isPassed) {
               const dist = getDistance(liveLocation.latitude, liveLocation.longitude, stop.latitude, stop.longitude);
               minutesAway = estimateTimeInMinutes(dist);
               const eta = new Date(Date.now() + minutesAway * 60000);
               leftTime = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            return (
              <React.Fragment key={stop.id}>
                {/* Stop Row */}
                <View style={styles.timelineRow}>
                  <View style={styles.tlTimeCol}>
                    <Text style={[styles.tlTimeText, isPassed && index === 0 && {color: '#D4D4D8'}]}>{leftTime}</Text>
                  </View>
                  
                  <View style={styles.tlLineCol}>
                    {/* Dot */}
                    {isDestination ? (
                      <View style={styles.destDot} />
                    ) : (
                      <View style={[styles.standardDot, isPassed && styles.passedDot, isNext && styles.nextDot]} />
                    )}
                    {/* Line going down */}
                    {index < stops.length - 1 && (
                      <View style={[styles.verticalLine, isPassed && styles.passedLine]} />
                    )}
                  </View>
                  
                  <View style={styles.tlInfoCol}>
                    <View style={styles.tlInfoTop}>
                      <Text style={[styles.stopNameText, (isNext || isDestination) && {color: isDestination ? '#81A5FF' : '#FFF'}]}>
                        {stop.name}
                      </Text>
                      
                      {isPassed && <Text style={styles.passedBadge}>✓ PASSED</Text>}
                      {isDestination && <Text style={styles.destBadge}>DESTINATION</Text>}
                    </View>
                    
                    <View style={styles.tlInfoBottom}>
                      {isNext ? (
                        <Text style={styles.tlSubText}>● CURRENT</Text>
                      ) : (
                        <Text style={styles.tlSubText}>
                          {isPassed && index === 0 ? departedTime : `Scheduled ${leftTime}`}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Right side badges (like 4 min or ETA 10:52 AM) */}
                  {isNext && (
                    <View style={styles.minBadge}>
                      <Text style={styles.minBadgeText}>{Math.max(1, minutesAway)} min</Text>
                    </View>
                  )}
                  {isDestination && (
                    <View style={styles.etaBlock}>
                      <Text style={styles.etaLabel}>ETA</Text>
                      <Text style={styles.etaTime}>{leftTime}</Text>
                    </View>
                  )}
                </View>

                {/* Bus Moving Row (Rendered between currentStopIndex -1 and currentStopIndex) */}
                {showBusAfterThisStop && (
                  <View style={styles.busMovingRow}>
                    <View style={styles.tlTimeCol} />
                    <View style={styles.tlLineCol}>
                      {/* Line continuing behind the bus */}
                      <View style={[styles.verticalLine, styles.passedLine, { position: 'absolute', top: -10, bottom: -10 }]} />
                      <View style={styles.busIconBox}>
                        <Text style={styles.busIconText}>🚌</Text>
                      </View>
                    </View>
                    <View style={styles.tlInfoCol}>
                      <View style={styles.movingPill}>
                        <Text style={styles.movingPillText}>Moving towards {stops[currentStopIndex]?.name}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#09090B' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#09090B' },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  backBtn: { paddingRight: 16, justifyContent: 'center' },
  iconText: { fontSize: 24, color: '#A1A1AA' },
  headerCenter: { flex: 1 },
  headerRouteName: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  liveTagContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  liveTagText: { color: '#22C55E', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  headerRight: { alignItems: 'flex-end' },
  busNoLabel: { color: '#71717A', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  busNoValue: { color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginTop: 2 },

  titleBlock: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  titleBold: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  titleSub: { color: '#A1A1AA', fontSize: 15, fontWeight: '500' },

  statusCard: { flexDirection: 'row', backgroundColor: '#18181B', marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#27272A', marginBottom: 24 },
  statusLeft: { flex: 1 },
  statusLabel: { color: '#71717A', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  statusValue: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statusDivider: { width: 1, backgroundColor: '#27272A', marginHorizontal: 16 },
  statusRight: { flex: 1, alignItems: 'flex-end', justifyContent: 'center' },
  statusLive: { color: '#22C55E', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  statusNextStop: { color: '#4ADE80', fontSize: 13, fontWeight: '500' },

  timelineScroll: { flex: 1 },
  timelineContent: { paddingHorizontal: 16, paddingBottom: 100 },
  
  timelineRow: { flexDirection: 'row', minHeight: 70 },
  tlTimeCol: { width: 75, paddingRight: 16, paddingTop: 2 },
  tlTimeText: { color: '#71717A', fontSize: 14, fontWeight: '500', textAlign: 'right' },
  
  tlLineCol: { width: 24, alignItems: 'center' },
  standardDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3F3F46', zIndex: 2 },
  passedDot: { backgroundColor: '#22C55E' },
  nextDot: { backgroundColor: '#FFF', borderWidth: 3, borderColor: '#3B82F6', width: 16, height: 16, borderRadius: 8 },
  destDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#81A5FF', backgroundColor: 'transparent', zIndex: 2 },
  verticalLine: { width: 2, backgroundColor: '#27272A', position: 'absolute', top: 12, bottom: -12, zIndex: 1 },
  passedLine: { backgroundColor: '#22C55E' },

  tlInfoCol: { flex: 1, paddingLeft: 16, paddingBottom: 24 },
  tlInfoTop: { flexDirection: 'row', alignItems: 'center' },
  stopNameText: { color: '#D4D4D8', fontSize: 17, fontWeight: '600', marginRight: 8 },
  passedBadge: { color: '#22C55E', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  destBadge: { backgroundColor: '#312E81', color: '#A5B4FC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 9, fontWeight: '800', overflow: 'hidden' },
  
  tlInfoBottom: { marginTop: 4 },
  tlSubText: { color: '#71717A', fontSize: 13 },

  minBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 1, borderColor: '#22C55E', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 2 },
  minBadgeText: { color: '#4ADE80', fontSize: 14, fontWeight: '700' },
  
  etaBlock: { alignItems: 'flex-end', paddingTop: 2 },
  etaLabel: { color: '#71717A', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  etaTime: { color: '#81A5FF', fontSize: 16, fontWeight: '800', marginTop: 2 },

  busMovingRow: { flexDirection: 'row', minHeight: 60, alignItems: 'center', marginTop: -10, marginBottom: 10 },
  busIconBox: { backgroundColor: '#F97316', width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  busIconText: { fontSize: 18 },
  movingPill: { backgroundColor: '#27272A', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, alignSelf: 'flex-start', marginLeft: 16 },
  movingPillText: { color: '#A1A1AA', fontSize: 13, fontWeight: '500' }
});
