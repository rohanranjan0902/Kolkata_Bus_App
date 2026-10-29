import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDriverStore } from '../../store/useDriverStore';
import { api } from '../../services/api';

export default function AddBusScreen() {
  const router = useRouter();
  const { setSelectedBus, setSelectedRoute, setActiveTrip } = useDriverStore();
  
  const [busNumber, setBusNumber] = useState('WB-XY-1234');
  const [routeNumber, setRouteNumber] = useState('42A');
  const [stopsCount, setStopsCount] = useState('10');
  const [loading, setLoading] = useState(false);

  const handleStartTracking = async () => {
    if (!busNumber || !routeNumber || !stopsCount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/simulator/create-demo', {
        busNumber,
        routeNumber,
        stopsCount: parseInt(stopsCount, 10) || 10
      });

      // Update store for the live tracking screen
      setSelectedBus({
        id: res.data.busId,
        registrationNumber: busNumber,
        displayName: busNumber,
        number: busNumber,
        type: 'Volvo',
        isAC: true
      } as any);

      setSelectedRoute({
        id: res.data.routeId,
        routeNumber: routeNumber,
        name: `${routeNumber} Route`,
      } as any);

      setActiveTrip(null); // Force live-tracking.tsx to init it
      
      router.push('/driver/live-tracking');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to configure trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Configuration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bus Number</Text>
          <TextInput 
            style={styles.input} 
            value={busNumber}
            onChangeText={setBusNumber}
            placeholder="e.g. WB-04-1234"
            placeholderTextColor="#71717A"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Route Number</Text>
          <TextInput 
            style={styles.input} 
            value={routeNumber}
            onChangeText={setRouteNumber}
            placeholder="e.g. 42A"
            placeholderTextColor="#71717A"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Stops</Text>
          <TextInput 
            style={styles.input} 
            value={stopsCount}
            onChangeText={setStopsCount}
            keyboardType="number-pad"
            placeholder="e.g. 10"
            placeholderTextColor="#71717A"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
          onPress={handleStartTracking} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Start Location Tracking</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  backBtn: { paddingRight: 16 },
  iconText: { fontSize: 24, color: '#A1A1AA' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  
  container: { padding: 20 },
  inputGroup: { marginBottom: 24 },
  label: { color: '#A1A1AA', fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#27272A', color: '#FFF', fontSize: 18, padding: 16, borderRadius: 12 },

  saveBtn: { backgroundColor: '#22C55E', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 32 },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
