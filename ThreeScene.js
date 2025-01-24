import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing icons for checkmark and warning

const ThreeScene = ({ idealPressures, setDisplayedDeviation, setFittingScore }) => {
  const [sensorData, setSensorData] = useState({ forehead: 0, back: 0, tube: 0 });
  const [deviations, setDeviations] = useState({ forehead: 0, back: 0, tube: 0 });

  useEffect(() => {
    const connectToArduino = () => {
      const ws = new WebSocket('ws://10.55.102.32:8082'); // WebSocket server address

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
        forehead: sensorData.forehead != null ? sensorData.forehead - idealPressures.forehead : NaN,
        back: sensorData.back != null ? sensorData.back - idealPressures.back : NaN,
        tube: sensorData.tube != null ? sensorData.tube - idealPressures.tube : NaN,
      };
      setDeviations(calculatedDeviations);
      setDisplayedDeviation(calculatedDeviations);
      console.log('Updated deviations:', calculatedDeviations);
    }
  }, [sensorData, idealPressures]);

  const getBackgroundColor = (deviation) => {
    return Math.abs(deviation) > 1 ? 'rgba(162, 0, 0, 0.8)' : 'rgba(11, 36, 71, 0.8)'; // Translucent red or blue
  };

  const renderIcon = (deviation) => {
    if (Math.abs(deviation) > 1) {
      return <Icon name="exclamation-circle" size={40} color="rgb(255, 127, 127)" style={styles.icon} />;
    } else {
      return <Icon name="check-circle" size={40} color="green" style={styles.icon} />;
    }
  };

  const formatDeviation = (deviation) => {
    if (isNaN(deviation)) return 'N/A';
    return `${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}`; // Adds + for positive deviations
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/welcome_image.png')} // Base image
        style={styles.baseImage}
      />

      {/* Forehead marker */}
      <View style={[styles.marker, { backgroundColor: getBackgroundColor(deviations.forehead), top: 40, left:30, }]}>
        {renderIcon(deviations.forehead)}
        <Text style={styles.placementText}>Forehead</Text>
        <Text style={styles.valueText}>{sensorData.forehead?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.deviationValue}>{formatDeviation(deviations.forehead)}</Text>
      </View>

      {/* Back marker */}
      <View style={[styles.marker, { backgroundColor: getBackgroundColor(deviations.back), top: 50, right: 60 }]}>
        {renderIcon(deviations.back)}
        <Text style={styles.placementText}>Back</Text>
        <Text style={styles.valueText}>{sensorData.back?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.deviationValue}>{formatDeviation(deviations.back)}</Text>
      </View>

      {/* Tube marker */}
      <View style={[styles.marker, { backgroundColor: getBackgroundColor(deviations.tube), top: 380, left: 20 }]}>
        {renderIcon(deviations.tube)}
        <Text style={styles.placementText}>Tube</Text>
        <Text style={styles.valueText}>{sensorData.tube?.toFixed(2) || '0.00'} cmH₂O</Text>
        <Text style={styles.deviationValue}>{formatDeviation(deviations.tube)}</Text>
      </View>

      {/* Ideal values display at the bottom */}
      <View style={styles.idealValuesContainer}>
        <Text style={styles.idealValuesHeading}>Your Ideal Values</Text>
        <View style={styles.idealValuesRow}>
          <View style={styles.idealValueBox}>
            <Text style={styles.idealValueTitle}>Forehead</Text>
            <Text style={styles.idealValueText}>{idealPressures?.forehead?.toFixed(2) || 'N/A'}</Text>
          </View>
          <View style={styles.idealValueBox}>
            <Text style={styles.idealValueTitle}>Back</Text>
            <Text style={styles.idealValueText}>{idealPressures?.back?.toFixed(2) || 'N/A'}</Text>
          </View>
          <View style={styles.idealValueBox}>
            <Text style={styles.idealValueTitle}>Tube</Text>
            <Text style={styles.idealValueText}>{idealPressures?.tube?.toFixed(2) || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#030B35', // Always dark mode
  },
  baseImage: {
    position: 'absolute',
    width: 500,
    height: 650,
  },
  idealValuesContainer: {
    width: '100%',
    backgroundColor: '#020924',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    bottom: 0,
    paddingVertical: 10,
    alignItems: 'center',
  },
  idealValuesHeading: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  idealValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  idealValueBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(11, 36, 71, 0.8)',
    borderRadius: 8,
    width: 100,
  },
  idealValueTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  idealValueText: {
    color: 'white',
    fontSize: 16,
  },
  marker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Light border for better contrast
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    padding: 12,
  },
  placementText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  valueText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  deviationValue: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  icon: {
    marginBottom: 8, // Add spacing between the icon and the text
  },
});

export default ThreeScene;
