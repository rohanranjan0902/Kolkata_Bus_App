import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch value={true} trackColor={{ false: '#767577', true: '#3B82F6' }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch value={true} trackColor={{ false: '#767577', true: '#3B82F6' }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Offline Maps</Text>
          <Switch value={false} trackColor={{ false: '#767577', true: '#3B82F6' }} />
        </View>

        <TouchableOpacity 
          style={styles.driverBtn}
          onPress={() => router.push('/driver/add-bus')}
        >
          <Text style={styles.driverBtnText}>Open Driver Portal (Demo)</Text>
        </TouchableOpacity>
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
  container: { padding: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  settingText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  driverBtn: { backgroundColor: '#F97316', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  driverBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
