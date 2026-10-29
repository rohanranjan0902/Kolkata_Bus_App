import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { authRepo } from '../../services/AuthRepository';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setDriver = useAuthStore(s => s.setDriver);

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !driverId) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const driver = await authRepo.register({ fullName, phone, driverId });
      setDriver(driver);
      router.replace('/driver/dashboard');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Registration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join as a driver to broadcast live location.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="e.g. John Doe" placeholderTextColor="#71717A" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="e.g. 9876543210" placeholderTextColor="#71717A" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driver ID / Employee ID</Text>
          <TextInput style={styles.input} value={driverId} onChangeText={setDriverId} placeholder="e.g. DRV-2000" placeholderTextColor="#71717A" autoCapitalize="characters" />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#71717A" secureTextEntry />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.back()}>
          <Text style={styles.registerText}>Already have an account? <Text style={styles.registerHighlight}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
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
  title: { color: '#FFF', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#A1A1AA', fontSize: 16, marginBottom: 32 },
  error: { color: '#EF4444', marginBottom: 16, fontSize: 14, backgroundColor: '#EF444420', padding: 12, borderRadius: 8 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#A1A1AA', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#27272A', borderRadius: 12, color: '#FFF', fontSize: 16, padding: 16 },
  loginBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  registerLink: { marginTop: 24, alignItems: 'center', paddingBottom: 40 },
  registerText: { color: '#A1A1AA', fontSize: 15 },
  registerHighlight: { color: '#3B82F6', fontWeight: '700' }
});
