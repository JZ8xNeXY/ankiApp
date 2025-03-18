import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const Anki = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <Text>Hello World5</Text>
      <StatusBar style="auto" />
    </View>
  );
};

export default Anki;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', 
  },
});