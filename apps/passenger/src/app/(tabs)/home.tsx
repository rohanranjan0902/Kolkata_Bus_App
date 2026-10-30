import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import io, { Socket } from 'socket.io-client';
import { useRouter } from 'expo-router';
import { getBaseUrl } from '../../services/api';

const { width, height } = Dimensions.get('window');

// Custom Dark Mode Map Style
const customMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export default function Home() {
  const router = useRouter();
  const [buses, setBuses] = useState<{ [id: string]: { lat: number; lng: number, routeNumber?: string, busStops?: string } }>({});

  useEffect(() => {
    const socket: Socket = io(getBaseUrl());
    
    socket.on('connect', () => {
      socket.emit('room.join', { room: 'admin:fleet' });
    });

    socket.on('bus.location.updated', (data) => {
      setBuses((prev) => ({
        ...prev,
        [data.busId]: { 
          lat: data.latitude, 
          lng: data.longitude,
          routeNumber: data.routeNumber,
          busStops: data.busStops
        }
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        customMapStyle={customMapStyle}
        userInterfaceStyle="dark"
        initialRegion={{
          latitude: 22.5645,
          longitude: 88.3433,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {Object.entries(buses).map(([id, busInfo]) => (
          <Marker
            key={id}
            coordinate={{ latitude: busInfo.lat, longitude: busInfo.lng }}
            title={busInfo.routeNumber ? `Route ${busInfo.routeNumber} (${id})` : `Bus ${id}`}
            description={busInfo.busStops ? `Stops: ${busInfo.busStops}` : undefined}
          >
            <View style={styles.busMarker}>
              <Text style={styles.routeBadge}>{busInfo.routeNumber || '🚌'}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <TouchableOpacity style={styles.overlay} onPress={() => router.push('/search')}>
        <Text style={styles.title}>BUSLY</Text>
        <Text style={styles.subtitle}>Where are you going?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090b' },
  map: { width: width, height: height },
  busMarker: {
    backgroundColor: '#3B82F6',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBadge: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#a1a1aa', marginTop: 4, fontWeight: '500' }
});
