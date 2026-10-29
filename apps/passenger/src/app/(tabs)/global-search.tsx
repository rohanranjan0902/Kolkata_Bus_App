import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { transitRepo } from '../../services/TransitRepository';
import { Route, Bus } from '../../models/types';
import { useAppStore } from '../../store/useAppStore';

export default function GlobalSearchTab() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const { toggleFavorite, favorites } = useAppStore();

  useEffect(() => {
    let active = true;
    const search = async () => {
      const res = await transitRepo.searchRoutes(query);
      if (active) setRoutes(res);
    };
    search();
    return () => { active = false; };
  }, [query]);

  const handleRouteClick = async (route: Route) => {
    const buses = await transitRepo.getBusesOnRoute(route.id);
    const busId = buses.length > 0 ? buses[0].id : 'b1';
    
    // Create a mock trip ID for navigation purposes
    const tripId = `trip_${route.id}_${Date.now()}`;
    
    router.push({
      pathname: '/tracking',
      params: { tripId, busId }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Routes</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputIcon}>🔍</Text>
          <TextInput 
            style={styles.input} 
            value={query} 
            onChangeText={setQuery} 
            placeholder="Search bus number or route name..." 
            placeholderTextColor="#71717A" 
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        data={routes}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
             <Text style={{ fontSize: 40, marginBottom: 16 }}>🚌</Text>
             <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>No routes found</Text>
             <Text style={{ color: '#A1A1AA', marginTop: 8, textAlign: 'center' }}>Try another bus number.</Text>
          </View>
        )}
        renderItem={({item}) => {
          const isFav = favorites.includes(item.id);
          return (
            <TouchableOpacity style={styles.resultCard} onPress={() => handleRouteClick(item)}>
              <View style={styles.rcHeader}>
                <View style={styles.rcTags}>
                  <View style={[styles.rcBadge, {backgroundColor: '#3B82F6'}]}><Text style={styles.rcBadgeText}>Route {item.routeNumber}</Text></View>
                  <Text style={styles.rcLive}>● Live</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.rcMainText}>{item.name}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Text style={{ fontSize: 24, color: isFav ? '#FBBF24' : '#A1A1AA' }}>{isFav ? '★' : '☆'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rcFooter}>
                <Text style={styles.rcFooterText}>{item.busType} • {item.isDirect ? 'Direct' : 'Transfers Available'}</Text>
                <Text style={styles.rcPrice}>~ ₹15.00</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, backgroundColor: '#1E1E1E', borderBottomWidth: 1, borderBottomColor: '#27272A' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 12, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#27272A' },
  inputIcon: { fontSize: 18, marginRight: 12, color: '#A1A1AA' },
  input: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '500' },
  
  resultCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#27272A' },
  rcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  rcTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rcBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rcBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  rcLive: { color: '#22C55E', fontSize: 12, fontWeight: '700' },
  rcMainText: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 16, width: '85%' },
  rcFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#27272A', paddingTop: 12 },
  rcFooterText: { color: '#A1A1AA', fontSize: 14, fontWeight: '500' },
  rcPrice: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
