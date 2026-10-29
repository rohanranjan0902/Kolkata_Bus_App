import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error, executionInfo }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    
    // Connect to websocket in background
    const host = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
    const socket = io(`http://${host}:3000`);
    
    // Read the driver details from AsyncStorage
    const busId = await AsyncStorage.getItem('driver_busId') || 'WB-04-1234';
    const routeNumber = await AsyncStorage.getItem('driver_routeNumber') || 'Unknown';
    const busStops = await AsyncStorage.getItem('driver_busStops') || '';

    socket.emit('driver.location.update', {
      busId: busId,
      routeNumber: routeNumber,
      busStops: busStops,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp
    });
    
    // Disconnect after emitting to prevent leaking background sockets
    setTimeout(() => socket.disconnect(), 1000);
  }
});
