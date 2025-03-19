import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../components/header";

const EditDeck = (): JSX.Element => {
  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.text}>Edit your Decks here</Text>
    </View>
  );
};

export default EditDeck;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8", paddingTop: 50 },
  text: { fontSize: 20, textAlign: "center", marginTop: 20 },
});