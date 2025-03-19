import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const Header = (): JSX.Element => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push("/")}>
        <Text style={styles.headerText}>Decks</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/../memo/add")}>
        <Text style={styles.headerText}>Add</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/../memo/edit")}>
        <Text style={styles.headerText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/../memo/find")}>
        <Text style={styles.headerText}>Find</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#467FD3",
  },
});