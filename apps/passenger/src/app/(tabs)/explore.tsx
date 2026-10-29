import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const POPULAR = [
  { id: '1', name: 'Esplanade', type: 'Major Terminus', emoji: '🏢' },
  { id: '2', name: 'Howrah Station', type: 'Railway Hub', emoji: '🚆' },
  { id: '3', name: 'Salt Lake Sector V', type: 'IT Hub', emoji: '💻' },
  { id: '4', name: 'Gariahat', type: 'Shopping', emoji: '🛍️' },
];

export default function ExploreTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Kolkata</Text>
        <Text style={styles.headerSub}>Discover popular destinations and hubs</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {POPULAR.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { to: item.name } })}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSub: { color: '#A1A1AA', fontSize: 14 },
  container: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#1E1E1E', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#27272A', alignItems: 'center' },
  emoji: { fontSize: 40, marginBottom: 12 },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  cardSub: { color: '#A1A1AA', fontSize: 12, textAlign: 'center' }
});
