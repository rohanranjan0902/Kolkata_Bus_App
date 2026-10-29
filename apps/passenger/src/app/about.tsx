import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.logo}>🚌</Text>
        <Text style={styles.title}>Kolkata Bus App</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.desc}>
          The easiest way to find, track, and ride buses across Kolkata.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, borderBottomWidth: 1, borderBottomColor: '#27272A' },
  backBtn: { paddingRight: 16 },
  iconText: { fontSize: 24, color: '#A1A1AA' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  container: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 80, marginBottom: 20 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  version: { color: '#81A5FF', fontSize: 16, marginBottom: 20 },
  desc: { color: '#A1A1AA', fontSize: 16, textAlign: 'center', lineHeight: 24 }
});
