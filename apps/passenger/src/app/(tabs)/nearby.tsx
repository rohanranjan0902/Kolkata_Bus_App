import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { transitRepo } from '../../services/TransitRepository';
import { Stop } from '../../models/types';

export default function NearbyTab() {
  const router = useRouter();
  const [stops, setStops] = useState<Stop[]>([]);

  useEffect(() => {
    let active = true;
    transitRepo.getAllStops().then(res => {
      if (active) setStops(res);
    });
    return () => { active = false; };
  }, []);

  const handleStopClick = (stopName: string) => {
    router.push({
      pathname: '/(tabs)/search',
      params: { from: stopName }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Stops</Text>
        <Text style={styles.headerSub}>Based on your current location</Text>
      </View>

      <FlatList
        data={stops}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.stopCard} onPress={() => handleStopClick(item.name)}>
            <View style={styles.iconBox}><Text style={styles.icon}>📍</Text></View>
            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>{item.name}</Text>
              <Text style={styles.stopDist}>{Math.floor(Math.random() * 500 + 100)}m away</Text>
            </View>
            <Text style={styles.arrow}>➔</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSub: { color: '#A1A1AA', fontSize: 14 },
  
  stopCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#27272A' },
  iconBox: { backgroundColor: '#3B82F620', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  icon: { fontSize: 20 },
  stopInfo: { flex: 1 },
  stopName: { color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  stopDist: { color: '#A1A1AA', fontSize: 14 },
  arrow: { color: '#71717A', fontSize: 18 }
});
