import { Tabs } from 'expo-router';
import { useColorScheme, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'dark' : scheme]; 

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#121212', borderTopWidth: 0 },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#A1A1AA',
      }}>
      
      <Tabs.Screen
        name="search"
        options={{ title: 'Home', tabBarIcon: () => <Text style={{fontSize: 20}}>🏠</Text> }}
      />
      <Tabs.Screen
        name="global-search"
        options={{ title: 'Search', tabBarIcon: () => <Text style={{fontSize: 20}}>🔍</Text> }}
      />
      <Tabs.Screen
        name="nearby"
        options={{ title: 'Nearby', tabBarIcon: () => <Text style={{fontSize: 20}}>📍</Text> }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: 'Saved', tabBarIcon: () => <Text style={{fontSize: 20}}>⭐</Text> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: () => <Text style={{fontSize: 20}}>🗺️</Text> }}
      />
    </Tabs>
  );
}
