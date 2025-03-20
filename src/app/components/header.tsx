import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../config";
import { signOut } from 'firebase/auth'

const Header = (): JSX.Element => {
  const router = useRouter();

  const handlePress = ():void => {
    signOut(auth)
    .then(() =>{
      router.replace('/auth/logIn')
    })
    .catch(() => {
      Alert.alert('ログアウトに失敗しました')
    })
  
  }

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
      <TouchableOpacity onPress={() => {handlePress()}}>
        <Text style={styles.headerText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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