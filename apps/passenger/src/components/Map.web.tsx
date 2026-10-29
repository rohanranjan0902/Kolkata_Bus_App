import React from 'react';
import { View, Text } from 'react-native';

export const MapView = ({ children, style, initialRegion }: any) => (
  <View style={[{ backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }, style]}>
    <Text style={{ color: '#888', marginBottom: 10 }}>🗺️ Map is not supported on the web version.</Text>
    <Text style={{ color: '#888', fontSize: 12 }}>(Please use Expo Go on your phone to see the live map)</Text>
    {/* We don't render children (Markers) on web since they depend on react-native-maps too */}
  </View>
);

export const Marker = ({ title }: any) => null;
