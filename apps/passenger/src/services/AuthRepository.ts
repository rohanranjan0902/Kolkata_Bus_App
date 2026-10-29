import { Driver } from '../models/driverTypes';
import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export class AuthRepository {
  async login(phone: string, password: string): Promise<Driver> {
    try {
      const response = await api.post('/auth/login', { phone, password });
      
      // Assume backend returns { token, user: { ... } }
      if (response.data.token) {
        await SecureStore.setItemAsync('auth_token', response.data.token);
        // Set the token on the default headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid credentials');
    }
  }

  async register(data: Partial<Driver>): Promise<Driver> {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
    delete api.defaults.headers.common['Authorization'];
  }
}

export const authRepo = new AuthRepository();
