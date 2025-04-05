import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type CustomRadioButtonProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({ label, selected, onSelect }) => {
  return (
    <Pressable onPress={onSelect} style={styles.radioRow}>
      <View style={[styles.outerCircle, selected && styles.selectedOuter]}>
        {selected && <View style={styles.innerCircle} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedOuter: {
    borderColor: '#007AFF',
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  label: {
    fontSize: 16,
  },
});

export default CustomRadioButton;