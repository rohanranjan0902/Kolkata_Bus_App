import axios from 'axios';
import { Platform } from 'react-native';

// For Android Emulator, localhost points to the emulator itself.
// 10.0.2.2 points to the host machine's localhost.
// For iOS simulator, localhost works fine.
// Replace with your actual local IP (e.g., 192.168.x.x) if testing on a physical device.
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// We can add interceptors here later for adding JWT tokens from SecureStore
