import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function ActiveTrip() {
  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 20.4632,
          longitude: 85.8775,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }}
      >
        <Marker
          coordinate={{ latitude: 20.4632, longitude: 85.8775 }}
          title="You"
        />
      </MapView>
      <View style={styles.bottomSheet}>
        <Text style={styles.status}>TRIP ACTIVE ●</Text>
        <Text style={styles.bus}>BUS-102</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  status: { color: 'green', fontWeight: 'bold' },
  bus: { fontSize: 24, fontWeight: 'bold', marginTop: 5 }
});
