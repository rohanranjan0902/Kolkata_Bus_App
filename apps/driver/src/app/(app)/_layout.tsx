import { Stack } from 'expo-router';
import '../locationTask'; // Import to register the background task

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Driver Home' }} />
      <Stack.Screen name="active-trip" options={{ title: 'Active Trip', headerShown: false }} />
    </Stack>
  );
}
