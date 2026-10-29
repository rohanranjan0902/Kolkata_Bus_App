import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { transitRepo } from '../../services/TransitRepository';
import { Route } from '../../models/types';
import { useAppStore } from '../../store/useAppStore';

export default function SavedTab() {
  const router = useRouter();
  const { favorites, toggleFavorite } = useAppStore();
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    let active = true;
    const fetchFavs = async () => {
      const allRoutes = await transitRepo.searchRoutes('');
      if (active) {
        setRoutes(allRoutes.filter(r => favorites.includes(r.id)));
      }
    };
    fetchFavs();
    return () => { active = false; };
  }, [favorites]);

  const handleRouteClick = async (route: Route) => {
    const buses = await transitRepo.getBusesOnRoute(route.id);
    const busId = buses.length > 0 ? buses[0].id : 'b1';
    const tripId = `trip_${route.id}_${Date.now()}`;
    router.push({
      pathname: '/tracking',
      params: { tripId, busId }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Favorites</Text>
        <Text style={styles.headerSub}>Your saved routes and stops.</Text>
      </View>
        
      {favorites.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center', marginTop: 40 }}>
           <Text style={{ fontSize: 40, marginBottom: 16 }}>⭐</Text>
           <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>No favorites yet</Text>
           <Text style={{ color: '#A1A1AA', marginTop: 8, textAlign: 'center' }}>Tap the star icon on any route to save it here.</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.resultCard} onPress={() => handleRouteClick(item)}>
              <View style={styles.rcHeader}>
                <View style={styles.rcTags}>
                  <View style={[styles.rcBadge, {backgroundColor: '#3B82F6'}]}><Text style={styles.rcBadgeText}>Route {item.routeNumber}</Text></View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={styles.rcMainText}>{item.name}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Text style={{ fontSize: 24, color: '#FBBF24' }}>★</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rcFooter}>
                <Text style={styles.rcFooterText}>{item.busType} • {item.isDirect ? 'Direct' : 'Transfers Available'}</Text>
                <Text style={styles.rcPrice}>~ ₹15.00</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSub: { color: '#A1A1AA', fontSize: 14 },
  
  resultCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#27272A' },
  rcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  rcTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rcBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rcBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  rcMainText: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 16, width: '85%' },
  rcFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#27272A', paddingTop: 12 },
  rcFooterText: { color: '#A1A1AA', fontSize: 14, fontWeight: '500' },
  rcPrice: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
