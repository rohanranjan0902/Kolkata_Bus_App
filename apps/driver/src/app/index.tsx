import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCATION_TASK_NAME } from '../locationTask';

export default function HomeScreen() {
  const [busId, setBusId] = useState('WB-04-1234');
  const [routeNumber, setRouteNumber] = useState('39A');
  const [busStops, setBusStops] = useState('Esplanade, Park St, Rabindra Sadan');
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Check if task is currently running
    TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME).then((registered) => {
      setIsTracking(registered);
    });
    
    // Load saved settings
    AsyncStorage.getItem('driver_busId').then(val => val && setBusId(val));
    AsyncStorage.getItem('driver_routeNumber').then(val => val && setRouteNumber(val));
    AsyncStorage.getItem('driver_busStops').then(val => val && setBusStops(val));
  }, []);

  const toggleTracking = async () => {
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
      return;
    }

    if (!busId || !routeNumber) {
      Alert.alert('Error', 'Please enter a Bus ID and Route Number');
      return;
    }

    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    if (fgStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Foreground location is required.');
      return;
    }

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Background location is required.');
      return;
    }

    // Save current info for the background task
    await AsyncStorage.setItem('driver_busId', busId);
    await AsyncStorage.setItem('driver_routeNumber', routeNumber);
    await AsyncStorage.setItem('driver_busStops', busStops);

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 2000,
      distanceInterval: 1,
      foregroundService: {
        notificationTitle: 'Driver Tracking Active',
        notificationBody: 'Broadcasting location to passengers',
        notificationColor: '#3B82F6',
      },
    });

    setIsTracking(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Driver Portal</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>BUS ID / REGISTRATION</Text>
        <TextInput
          style={styles.input}
          value={busId}
          onChangeText={setBusId}
          placeholder="e.g. WB-04-1234"
          placeholderTextColor="#71717A"
          editable={!isTracking}
        />

        <Text style={styles.label}>ROUTE NUMBER</Text>
        <TextInput
          style={styles.input}
          value={routeNumber}
          onChangeText={setRouteNumber}
          placeholder="e.g. 39A"
          placeholderTextColor="#71717A"
          editable={!isTracking}
        />

        <Text style={styles.label}>BUS STOPS (COMMA SEPARATED)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={busStops}
          onChangeText={setBusStops}
          placeholder="e.g. Esplanade, Park Street"
          placeholderTextColor="#71717A"
          editable={!isTracking}
          multiline
        />
        
        <TouchableOpacity 
          style={[styles.button, isTracking ? styles.buttonStop : styles.buttonStart]} 
          onPress={toggleTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? '⏹ STOP SHIFT' : '▶ START SHIFT'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isTracking && (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>🟢 Live tracking active</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#09090b',
    padding: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  label: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#121212',
    color: '#FFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonStart: {
    backgroundColor: '#22C55E',
  },
  buttonStop: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
});
