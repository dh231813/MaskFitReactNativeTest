import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import SetPressureScreen from './SetPressure';
import ThreeScene from './ThreeScene';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [pressure, setPressure] = useState(12);
  const [displayedDeviation, setDisplayedDeviation] = useState(12);
  const [fittingScore, setFittingScore] = useState(50);

  const handleNextStep = (pressure) => {
    setPressure(pressure);
    setCurrentStep(currentStep + 1);
  };

  return (
    <View style={styles.appContainer}>
      {currentStep === 0 && (
        <WelcomeScreen onNext={() => setCurrentStep(1)} />
      )}

      {currentStep === 1 && (
        <SetPressureScreen onNext={handleNextStep} />
      )}

      {currentStep === 2 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>MaskFit</Text>
          <Text style={styles.text}>Ideal pressure is {pressure} cmH₂O</Text>

          <ThreeScene
            pressure={pressure}
            setDisplayedDeviation={setDisplayedDeviation}
            setFittingScore={setFittingScore}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default App;
