import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';

export default function DriverDashboard() {
  const router = useRouter();
  const { driver, isAuthenticated, logout } = useAuthStore();
  const { selectedBus, selectedRoute, activeTrip } = useDriverStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/driver/login');
    } else if (activeTrip && activeTrip.status !== 'ENDED') {
      router.replace('/driver/live-tracking');
    }
  }, [isAuthenticated, activeTrip]);

  if (!isAuthenticated) return null;

  const handleStartTrip = () => {
    if (!selectedBus || !selectedRoute) {
      Alert.alert('Configuration Required', 'Please select a bus and a route before starting the trip.');
      return;
    }
    
    Alert.alert(
      'Start Live Trip?',
      `Bus: ${selectedBus.number}\nRoute: ${selectedRoute.routeNumber}\n\nYour live location will be shared with passengers while this trip is active.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Live Tracking', 
          style: 'default',
          onPress: () => router.push('/driver/live-tracking')
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
        logout();
        router.replace('/(tabs)/search'); // Send back to home/search
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening,</Text>
          <Text style={styles.driverName}>{driver?.fullName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>● READY</Text></View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Driver ID</Text>
            <Text style={styles.statusValue}>{driver?.driverId}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Trip Configuration</Text>

        <TouchableOpacity style={styles.configCard} onPress={() => router.push('/driver/add-bus')}>
          <View>
            <Text style={styles.configLabel}>Bus</Text>
            <Text style={selectedBus ? styles.configValue : styles.configEmpty}>
              {selectedBus ? selectedBus.number : 'Not assigned'}
            </Text>
          </View>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.configCard} onPress={() => router.push('/driver/add-bus')}>
          <View>
            <Text style={styles.configLabel}>Route</Text>
            <Text style={selectedRoute ? styles.configValue : styles.configEmpty}>
              {selectedRoute ? `${selectedRoute.routeNumber} (${selectedRoute.name})` : 'Not active'}
            </Text>
          </View>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.startBtn, (!selectedBus || !selectedRoute) && styles.startBtnDisabled]} 
          onPress={handleStartTrip}
          disabled={!selectedBus || !selectedRoute}
        >
          <Text style={styles.startBtnText}>START TRIP</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 20, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#27272A' },
  greeting: { color: '#A1A1AA', fontSize: 16 },
  driverName: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#EF444420', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: '#EF4444', fontWeight: '600' },
  
  container: { padding: 20 },
  
  statusCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#27272A' },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  badge: { backgroundColor: '#22C55E20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#22C55E', fontWeight: '700', fontSize: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#27272A' },
  statusLabel: { color: '#A1A1AA', fontSize: 14 },
  statusValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  
  configCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#27272A' },
  configLabel: { color: '#A1A1AA', fontSize: 14, marginBottom: 4 },
  configValue: { color: '#3B82F6', fontSize: 18, fontWeight: '700' },
  configEmpty: { color: '#71717A', fontSize: 16, fontStyle: 'italic' },
  arrow: { color: '#A1A1AA', fontSize: 18 },

  startBtn: { backgroundColor: '#3B82F6', padding: 20, borderRadius: 16, alignItems: 'center', marginTop: 24, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  startBtnDisabled: { backgroundColor: '#27272A', shadowOpacity: 0, elevation: 0 },
  startBtnText: { color: '#FFF', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
});
