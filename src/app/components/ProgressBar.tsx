import React from 'react';
import { View, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

interface ProgressBarProps {
  progress: number; // 0 ~ 1 の間の値
}

const ProgressBar = ({ progress }: ProgressBarProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <Progress.Bar
        progress={progress}
        width={100}
        color="#467FD3"
        borderRadius={4}
        height={10}
        animated={true}
      />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: 'center',
  },
});