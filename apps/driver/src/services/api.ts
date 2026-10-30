import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost') {
    return `http://${host}:3000`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};
