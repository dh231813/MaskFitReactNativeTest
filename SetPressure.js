import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const SetPressureScreen = ({ onNext }) => {
  const [tubePressure, setTubePressure] = useState(12); // Default value for CPAP pressure
  const [foreheadPressure, setForeheadPressure] = useState(null);
  const [backPressure, setBackPressure] = useState(null);
  const [sensorData, setSensorData] = useState({ forehead: 0, back: 0 });
  const [foreheadEditable, setForeheadEditable] = useState(true);
  const [backEditable, setBackEditable] = useState(true);

  useEffect(() => {
    const connectToArduino = () => {
      const ws = new WebSocket('ws://192.168.0.123:8082'); // Replace with your WebSocket server address

      ws.onmessage = (event) => {
        const data = event.data.trim();
        const parsedData = data.split('\n').reduce((acc, line) => {
          if (line.includes('FSR1_Hinterkopf')) {
            const match = line.match(/Force = ([0-9.]+)/);
            if (match) acc.back = parseFloat(match[1]);
          } else if (line.includes('FSR2_Stirn')) {
            const match = line.match(/Force = ([0-9.]+)/);
            if (match) acc.forehead = parseFloat(match[1]);
          }
          return acc;
        }, {});
        setSensorData((prev) => ({ ...prev, ...parsedData }));
      };

      ws.onopen = () => console.log('WebSocket connected');
      ws.onerror = (err) => console.error('WebSocket error:', err);
      ws.onclose = () => console.log('WebSocket closed');

      return () => ws.close();
    };

    connectToArduino();
  }, []);

  const handleNext = () => {
    if (tubePressure >= 6 && tubePressure <= 20 && foreheadPressure != null && backPressure != null) {
      onNext({
        tube: tubePressure,
        forehead: foreheadPressure,
        back: backPressure,
      });
    } else {
      console.error('Invalid pressure values. Please check your inputs.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Ideal Pressures</Text>

      {/* CPAP Pressure Slider */}
      <Text style={styles.description}>Set Your CPAP Pressure:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(tubePressure)}
        onChangeText={(value) => setTubePressure(parseFloat(value) || 12)}
      />

      {/* Forehead Pressure Input */}
      <Text style={styles.description}>Forehead Pressure:</Text>
      <TextInput
        style={styles.input}
        editable={foreheadEditable}
        value={foreheadEditable ? sensorData.forehead?.toFixed(2) || '0.00' : foreheadPressure?.toFixed(2) || '0.00'}
      />
      <View style={styles.buttonGroup}>
        <Button
          title="Set as Ideal"
          onPress={() => {
            setForeheadPressure(sensorData.forehead);
            setForeheadEditable(false);
          }}
          disabled={!foreheadEditable}
        />
        <Button
          title="Unset"
          onPress={() => {
            setForeheadPressure(null);
            setForeheadEditable(true);
          }}
          disabled={foreheadEditable}
        />
      </View>

      {/* Back Pressure Input */}
      <Text style={styles.description}>Back Pressure:</Text>
      <TextInput
        style={styles.input}
        editable={backEditable}
        value={backEditable ? sensorData.back?.toFixed(2) || '0.00' : backPressure?.toFixed(2) || '0.00'}
      />
      <View style={styles.buttonGroup}>
        <Button
          title="Set as Ideal"
          onPress={() => {
            setBackPressure(sensorData.back);
            setBackEditable(false);
          }}
          disabled={!backEditable}
        />
        <Button
          title="Unset"
          onPress={() => {
            setBackPressure(null);
            setBackEditable(true);
          }}
          disabled={backEditable}
        />
      </View>

      <Button title="Next" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    width: '80%',
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 16,
  },
});

export default SetPressureScreen;
