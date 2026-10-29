import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { transitRepo } from '../services/TransitRepository';
import { Stop } from '../models/types';
import { useAppStore } from '../store/useAppStore';

export default function LocationPicker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as 'from' | 'to';
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stop[]>([]);
  const { recentSearches } = useAppStore();

  useEffect(() => {
    let active = true;
    const fetchStops = async () => {
      const stops = await transitRepo.searchStops(query);
      if (active) setResults(stops);
    };
    fetchStops();
    return () => { active = false; };
  }, [query]);

  const selectStop = (stopName: string) => {
    // We pass back the selected stop via router.back() isn't easy with params in expo-router v2. 
    // Usually, we set it in global state or route params. 
    // We can use setParams on the previous route, but Zustand is easier.
    // Let's just create a transient Zustand store for "currentSearch" or pass it back via router.push to the home page with query params.
    router.push({
      pathname: '/(tabs)/search',
      params: { [type]: stopName }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <TextInput 
          style={styles.searchInput} 
          placeholder={`Search ${type === 'from' ? 'origin' : 'destination'}...`}
          placeholderTextColor="#71717A"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => selectStop(item.name)}>
            <Text style={styles.resultIcon}>📍</Text>
            <View>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultSub}>Kolkata Bus Stop</Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          !query && recentSearches.length > 0 ? (
            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recent</Text>
              {recentSearches.slice(0, 3).map(s => (
                <TouchableOpacity key={s.id} style={styles.recentItem} onPress={() => selectStop(type === 'from' ? s.origin : s.destination)}>
                  <Text style={styles.resultIcon}>🕒</Text>
                  <Text style={styles.resultName}>{type === 'from' ? s.origin : s.destination}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#27272A', paddingTop: Platform.OS === 'android' ? 40 : 16 },
  backBtn: { paddingRight: 16 },
  iconText: { fontSize: 24, color: '#A1A1AA' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 18 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  resultIcon: { fontSize: 20, marginRight: 16, color: '#71717A' },
  resultName: { color: '#FFF', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  resultSub: { color: '#71717A', fontSize: 12 },
  recentSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  recentTitle: { color: '#A1A1AA', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }
});
