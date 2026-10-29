import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Platform, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { voiceSearchService } from '../../services/VoiceSearchService';
import { useAppStore } from '../../store/useAppStore';

export default function SearchRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addRecentSearch } = useAppStore();
  
  const [fromText, setFromText] = useState('Esplanade');
  const [toText, setToText] = useState('Howrah Station');
  const [isListening, setIsListening] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (params.from && typeof params.from === 'string') setFromText(params.from);
    if (params.to && typeof params.to === 'string') setToText(params.to);
  }, [params.from, params.to]);

  const swapLocations = () => {
    const temp = fromText;
    setFromText(toText);
    setToText(temp);
  };

  const handleVoiceSearch = async () => {
    setIsListening(true);
    await voiceSearchService.startListening((text) => {
      const { origin, destination } = voiceSearchService.parseLocations(text);
      if (origin) setFromText(origin);
      if (destination) setToText(destination);
      setIsListening(false);
    }, () => setIsListening(false));
  };

  const handleFindBuses = () => {
    addRecentSearch(fromText, toText);
    router.push({
      pathname: '/results',
      params: { origin: fromText, destination: toText }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={drawerVisible} animationType="fade" transparent={true}>
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContent}>
            <TouchableOpacity onPress={() => setDrawerVisible(false)} style={{alignItems: 'flex-end', marginBottom: 20}}>
              <Text style={{color: '#FFF', fontSize: 24}}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.drawerTitle}>Menu</Text>
            {['Home', 'Search', 'Nearby Stops', 'Favorites', 'Driver Mode', 'Settings', 'About'].map((item) => (
              <TouchableOpacity key={item} style={styles.drawerItem} onPress={() => {
                setDrawerVisible(false);
                switch(item) {
                  case 'Home': break;
                  case 'Search': router.push('/global-search'); break;
                  case 'Nearby Stops': router.push('/nearby'); break;
                  case 'Favorites': router.push('/saved'); break;
                  case 'Driver Mode': router.push('/driver/dashboard'); break;
                  case 'Settings': router.push('/settings'); break;
                  case 'About': router.push('/about'); break;
                }
              }}>
                <Text style={item === 'Driver Mode' ? styles.drawerItemTextAccent : styles.drawerItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}><Text style={styles.iconText}>☰</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Kolkata Bus App</Text>
          <TouchableOpacity onPress={handleVoiceSearch}>
            {isListening ? <ActivityIndicator color="#81A5FF" /> : <Text style={styles.iconText}>🎤</Text>}
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          <View style={[styles.tag, styles.tagActive]}>
            <Text style={[styles.tagText, styles.tagTextActive]}>🚌 Buses</Text>
          </View>
          <View style={styles.tag}><Text style={styles.tagText}>City</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>Electric</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>AC</Text></View>
          <View style={styles.tag}><Text style={styles.tagText}>Suburban</Text></View>
        </ScrollView>

        {/* Main Search Card */}
        <View style={styles.searchCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FROM</Text>
            <TouchableOpacity style={styles.inputBox} onPress={() => router.push({ pathname: '/location-picker', params: { type: 'from' } })}>
              <Text style={styles.inputIcon}>◎</Text>
              <Text style={styles.inputText}>{fromText || 'Select origin'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TO</Text>
            <TouchableOpacity style={styles.inputBox} onPress={() => router.push({ pathname: '/location-picker', params: { type: 'to' } })}>
              <Text style={styles.inputIcon}>📍</Text>
              <Text style={styles.inputText}>{toText || 'Select destination'}</Text>
            </TouchableOpacity>
          </View>

          {/* Swap Button (Absolute) */}
          <TouchableOpacity style={styles.swapBtn} onPress={swapLocations}>
            <Text style={styles.swapIcon}>⇅</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.findBtn} onPress={handleFindBuses}>
            <Text style={styles.findBtnText}>🔍 Find Buses</Text>
          </TouchableOpacity>

          <View style={styles.globalSearchBox}>
            <Text style={styles.inputIcon}>🔍</Text>
            <TextInput style={styles.globalSearchInput} placeholder="Search by Bus Name or Route" placeholderTextColor="#71717A" />
          </View>
        </View>

        {/* Live Departures */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>((•)) Live Departures</Text>
            <Text style={styles.sectionSubtitle}>Kolkata Central</Text>
          </View>
          
          <View style={[styles.departureItem, styles.departureActive]}>
            <View style={styles.depLeft}>
              <Text style={styles.depRouteActive}>Route 221</Text>
              <Text style={styles.depPlatform}>Platform 4</Text>
            </View>
            <Text style={styles.depTimeAlert}>● 5 mins</Text>
          </View>

          <View style={styles.departureItem}>
            <View style={styles.depLeft}>
              <Text style={styles.depRoute}>Route AC-12</Text>
              <Text style={styles.depPlatform}>Platform 12</Text>
            </View>
            <Text style={styles.depTime}>12 mins</Text>
          </View>

          <View style={styles.departureItem}>
            <View style={styles.depLeft}>
              <Text style={styles.depRoute}>Route 105</Text>
              <Text style={styles.depPlatform}>Platform 7</Text>
            </View>
            <Text style={styles.depTime}>18 mins</Text>
          </View>
        </View>

        {/* Search History */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🕒 Search History</Text>
          
          <View style={styles.historyItem}>
            <View style={styles.historyIconBox}><Text style={styles.historyIcon}>⎎</Text></View>
            <View>
              <Text style={styles.historyRoute}>221: Esplanade → Airport</Text>
              <Text style={styles.historyMeta}>2 days ago</Text>
            </View>
          </View>

          <View style={styles.historyItem}>
            <View style={styles.historyIconBox}><Text style={styles.historyIcon}>⎎</Text></View>
            <View>
              <Text style={styles.historyRoute}>AC-12: Salt Lake → Jadavpur</Text>
              <Text style={styles.historyMeta}>Last week</Text>
            </View>
          </View>
        </View>

        {/* Live Network Map Placeholder */}
        <View style={styles.networkMapCard}>
          <View style={styles.networkMapTextContainer}>
            <Text style={styles.networkMapTitle}>Live Network Map</Text>
            <Text style={styles.networkMapSub}>View all active buses in Kolkata</Text>
          </View>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/home')}>
            <Text style={styles.exploreBtnText}>Explore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingBusBtn} onPress={() => router.push('/home')}>
            <Text style={styles.floatingBusIcon}>🚌</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{height: 100}} /> 
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  iconText: { fontSize: 24, color: '#A1A1AA' },
  tagsContainer: { flexDirection: 'row', marginBottom: 24 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#27272A', marginRight: 10, height: 38, justifyContent: 'center' },
  tagActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  tagText: { color: '#A1A1AA', fontSize: 14, fontWeight: '500' },
  tagTextActive: { color: '#FFF', fontWeight: '600' },
  
  searchCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#27272A' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { color: '#71717A', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121212', borderRadius: 12, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#27272A' },
  inputIcon: { fontSize: 18, marginRight: 12, color: '#A1A1AA' },
  input: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '500' },
  inputText: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '500' },
  swapBtn: { position: 'absolute', right: 24, top: 62, backgroundColor: '#81A5FF', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  swapIcon: { color: '#121212', fontSize: 18, fontWeight: '900' },
  
  findBtn: { backgroundColor: '#4F85FF', borderRadius: 12, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 16 },
  findBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  
  globalSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181B', borderRadius: 12, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#27272A' },
  globalSearchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  
  sectionCard: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#27272A' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  sectionSubtitle: { color: '#71717A', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  departureItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#27272A', padding: 16, borderRadius: 12, marginBottom: 10 },
  departureActive: { borderLeftWidth: 4, borderLeftColor: '#22C55E' },
  depLeft: { flex: 1 },
  depRouteActive: { color: '#81A5FF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  depRoute: { color: '#A1A1AA', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  depPlatform: { color: '#71717A', fontSize: 12 },
  depTimeAlert: { color: '#F97316', fontSize: 16, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  depTime: { color: '#D4D4D8', fontSize: 16, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272A', padding: 16, borderRadius: 12, marginBottom: 10 },
  historyIconBox: { width: 40, height: 40, backgroundColor: '#3F3F46', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  historyIcon: { color: '#A1A1AA', fontSize: 18 },
  historyRoute: { color: '#F4F4F5', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  historyMeta: { color: '#71717A', fontSize: 12 },

  networkMapCard: { height: 180, backgroundColor: '#000', borderRadius: 16, padding: 20, justifyContent: 'flex-end', overflow: 'hidden', borderWidth: 1, borderColor: '#27272A' },
  networkMapTextContainer: { zIndex: 2 },
  networkMapTitle: { color: '#81A5FF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  networkMapSub: { color: '#A1A1AA', fontSize: 13, marginBottom: 12, width: '60%' },
  exploreBtn: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start', zIndex: 2 },
  exploreBtnText: { color: '#000', fontWeight: '700' },
  floatingBusBtn: { position: 'absolute', right: -10, bottom: -10, backgroundColor: '#F97316', width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 3 },
  floatingBusIcon: { fontSize: 28 },
  
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-start', flexDirection: 'row' },
  drawerContent: { width: '70%', height: '100%', backgroundColor: '#1E1E1E', padding: 20, paddingTop: 60 },
  drawerTitle: { color: '#81A5FF', fontSize: 24, fontWeight: '800', marginBottom: 24 },
  drawerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  drawerItemText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  drawerItemTextAccent: { color: '#3B82F6', fontSize: 16, fontWeight: '700' }
});
