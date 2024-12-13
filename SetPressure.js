import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Slider from '@react-native-community/slider';

const SetPressureScreen = ({ onNext }) => {
  const [pressure, setPressure] = useState(12); // Default value

  const handleNext = () => {
    if (pressure >= 6 && pressure <= 20) {
      onNext(pressure); // Pass the entered pressure to the next screen
    }
  };

  const handleChange = (value) => {
    setPressure(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your CPAP Pressure</Text>
      <Text style={styles.description}>Please move the slider to set your ideal air pressure value.</Text>
      <Text style={styles.selectedPressure}>Selected Pressure: {pressure}</Text>
      <Slider
        style={styles.slider}
        minimumValue={6}
        maximumValue={20}
        step={1}
        value={pressure}
        onValueChange={handleChange}
      />
      <Text style={styles.consultText}>
        Consult your healthcare provider to determine your ideal pressure, typically ranging between 6 and 14 cmH₂O.
      </Text>
      <Button
        title="Next"
        onPress={handleNext}
        color="#6f4ef2"
      />
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
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedPressure: {
    fontSize: 20,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  slider: {
    width: '80%',
    height: 40,
    marginBottom: 16,
  },
  consultText: {
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default SetPressureScreen;
