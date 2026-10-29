import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-bus" />
      <Stack.Screen name="live-tracking" />
    </Stack>
  );
}
