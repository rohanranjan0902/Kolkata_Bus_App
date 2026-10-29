import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Tickets() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tickets & Passes coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#A1A1AA', fontSize: 16 }
});
