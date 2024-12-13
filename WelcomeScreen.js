import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import placeholderImage from './assets/icon.png';

const WelcomeScreen = ({ onNext }) => {
  return (
    <View style={styles.container}>
      <Image
        source={placeholderImage}
        style={styles.image}
      />
      <Text style={styles.title}>
        Welcome to MaskFit
      </Text>
      <Text style={styles.description}>
        We're here to help you achieve the perfect mask fit. Let's get started by setting up your ideal settings.
      </Text>
      <Button
        title="Get Started"
        onPress={onNext}
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
  image: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#a8b0d3',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
