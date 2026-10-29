import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { authRepo } from '../../services/AuthRepository';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  driverId: z.string().min(3, 'Driver ID / Password must be at least 3 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const [error, setError] = useState('');
  const setDriver = useAuthStore(s => s.setDriver);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '9876543210',
      driverId: 'password', // Typically backend expects password
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const driver = await authRepo.login(data.phone, data.driverId);
      setDriver(driver);
      router.replace('/driver/dashboard');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Login</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your driver credentials to start.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="phone-pad"
                placeholder="e.g. 9876543210"
                placeholderTextColor="#71717A"
              />
            )}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password / Driver ID</Text>
          <Controller
            control={control}
            name="driverId"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.driverId && styles.inputError]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="e.g. password123"
                placeholderTextColor="#71717A"
                secureTextEntry
              />
            )}
          />
          {errors.driverId && <Text style={styles.errorText}>{errors.driverId.message}</Text>}
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/driver/register')}>
          <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerHighlight}>Register</Text></Text>
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
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#A1A1AA', fontSize: 16, marginBottom: 32 },
  error: { color: '#EF4444', marginBottom: 16, fontSize: 14, backgroundColor: '#EF444420', padding: 12, borderRadius: 8 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#A1A1AA', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#27272A', borderRadius: 12, color: '#FFF', fontSize: 16, padding: 16 },
  inputError: { borderColor: '#EF4444' },
  loginBtn: { backgroundColor: '#3B82F6', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  registerLink: { marginTop: 24, alignItems: 'center' },
  registerText: { color: '#A1A1AA', fontSize: 15 },
  registerHighlight: { color: '#3B82F6', fontWeight: '700' }
});
