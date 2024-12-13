import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

const ThreeScene = ({ pressure, setDisplayedDeviation, setFittingScore }) => {
  const [sensorData, setSensorData] = useState({ forehead: 0, back: 0, tube: 0 });

  useEffect(() => {
    const connectToArduino = () => {
      const ws = new WebSocket('ws://192.168.0.123:8082'); // Replace with your laptop's WebSocket server address

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        console.log('Raw data from WebSocket:', event.data); // Debug raw data from Arduino
        const data = event.data.trim();
        const lines = data.split('\n');
        const parsedData = lines.reduce((acc, line) => {
          if (line.includes('FSR1_Hinterkopf')) {
            const match = line.match(/Force = ([0-9.]+)/);
            if (match) acc.back = parseFloat(match[1]);
          } else if (line.includes('FSR2_Stirn')) {
            const match = line.match(/Force = ([0-9.]+)/);
            if (match) acc.forehead = parseFloat(match[1]);
          } else if (line.includes('Luftdruck Sensor')) {
            const match = line.match(/Pressure = ([0-9.]+)/);
            if (match) acc.tube = parseFloat(match[1]);
          }
          return acc;
        }, {});
        console.log('Parsed sensor data:', parsedData); // Debug parsed data
        setSensorData((prev) => ({ ...prev, ...parsedData }));
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return () => {
        ws.close();
      };
    };

    connectToArduino();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ ...styles.marker, backgroundColor: 'red' }}>
        <Text style={styles.markerText}>Forehead: {sensorData.forehead.toFixed(2)} kg</Text>
      </View>
      <View style={{ ...styles.marker, backgroundColor: 'blue' }}>
        <Text style={styles.markerText}>Back: {sensorData.back.toFixed(2)} kg</Text>
      </View>
      <View style={{ ...styles.marker, backgroundColor: 'green' }}>
        <Text style={styles.markerText}>Tube: {sensorData.tube.toFixed(2)} psi</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030B35',
  },
  marker: {
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
  },
  markerText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ThreeScene;
