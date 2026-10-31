import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://kolkata-bus-api.onrender.com';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});
