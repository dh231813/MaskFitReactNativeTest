import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

const ThreeScene = ({ idealPressures, setDisplayedDeviation, setFittingScore }) => {
  const [sensorData, setSensorData] = useState({ forehead: 0, back: 0, tube: 0 });
  const [deviations, setDeviations] = useState({ forehead: 0, back: 0, tube: 0 });
  const [statusMessages, setStatusMessages] = useState({ forehead: '', back: '', tube: '' });

  useEffect(() => {
    const connectToArduino = () => {
      const ws = new WebSocket('ws://192.168.0.123:8082'); // Replace with your WebSocket server address

      ws.onopen = () => {
        console.log('WebSocket connection established');
      };

      ws.onmessage = (event) => {
        console.log('Raw data from WebSocket:', event.data); // Debug raw data
        const data = event.data.trim();
        const lines = data.split('\n');
        const parsedData = lines.reduce((acc, line) => {
          console.log('Processing line:', line); // Debug each line
          if (line.includes('FSR1_Hinterkopf')) {
            const match = line.match(/Force = ([0-9.]+)/);
            if (match) acc.back = parseFloat(match[1]);
          } else if (line.includes('FSR2_Stirn')) {
            const match = line.match(/Force = ([0-9.]+)/);
            if (match) acc.forehead = parseFloat(match[1]);
          } else if (line.includes('Luftdruck Sensor')) {
            const match = line.match(/Pressure = (-?[0-9.]+)/);
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

  useEffect(() => {
    if (idealPressures && sensorData) {
      const calculatedDeviations = {
        forehead: sensorData.forehead != null ? Math.abs(sensorData.forehead - idealPressures.forehead) : NaN,
        back: sensorData.back != null ? Math.abs(sensorData.back - idealPressures.back) : NaN,
        tube: sensorData.tube != null ? Math.abs(sensorData.tube - idealPressures.tube) : NaN,
      };
      setDeviations(calculatedDeviations);
      setDisplayedDeviation(calculatedDeviations);
      console.log('Updated deviations:', calculatedDeviations);

      const newStatusMessages = {
        forehead: calculatedDeviations.forehead > 3 ? 'High deviation for forehead!' : 'Forehead pressure OK.',
        back: calculatedDeviations.back > 3 ? 'High deviation for back!' : 'Back pressure OK.',
        tube: calculatedDeviations.tube > 3 ? 'High deviation for tube!' : 'Tube pressure OK.',
      };
      setStatusMessages(newStatusMessages);
    }
  }, [sensorData, idealPressures]);

  return (
    <View style={styles.container}>
      <View style={{ ...styles.marker, backgroundColor: 'red' }}>
        <Text style={styles.markerText}>Forehead: {sensorData.forehead?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.deviationText}>Deviation: {isNaN(deviations.forehead) ? 'N/A' : deviations.forehead.toFixed(2)}</Text>
        <Text style={styles.statusMessage}>{statusMessages.forehead}</Text>
      </View>
      <View style={{ ...styles.marker, backgroundColor: 'blue' }}>
        <Text style={styles.markerText}>Back: {sensorData.back?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.deviationText}>Deviation: {isNaN(deviations.back) ? 'N/A' : deviations.back.toFixed(2)}</Text>
        <Text style={styles.statusMessage}>{statusMessages.back}</Text>
      </View>
      <View style={{ ...styles.marker, backgroundColor: 'green' }}>
        <Text style={styles.markerText}>Tube: {sensorData.tube?.toFixed(2) || '0.00'} cmH₂O</Text>
        <Text style={styles.deviationText}>Deviation: {isNaN(deviations.tube) ? 'N/A' : deviations.tube.toFixed(2)} cmH₂O</Text>
        <Text style={styles.statusMessage}>{statusMessages.tube}</Text>
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
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
  },
  markerText: {
    color: 'white',
    fontSize: 16,
  },
  deviationText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  statusMessage: {
    color: 'yellow',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default ThreeScene;
