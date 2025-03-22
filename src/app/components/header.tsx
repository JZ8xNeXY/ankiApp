import React from "react";
import { View, Text, StyleSheet, TouchableOpacity,Alert } from "react-native";
import { auth } from "../../config";
import { signOut } from 'firebase/auth'
import { useRouter, useLocalSearchParams } from "expo-router";

interface HeaderProps {
  deckId?: string;
  deckName?: string;
  flashcardId?: string;
  flashcardFront?: string;
  flashcardBack?: string;
  tags?: string;
}

const Header = ({   
  deckId,
  deckName,
  flashcardId,
  flashcardFront,
  flashcardBack,
  tags, }: HeaderProps): JSX.Element => {
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

  const handleAddPress = () => {
    router.push({
      pathname: "/memo/add",
      params: {
        deckId,
        deckName,
        flashcardId,
        flashcardFront,
        flashcardBack,
        tags,
      },
    });
    console.log(deckId,deckName)
  };


  const handleEditPress = () => {
    router.push({
      pathname: "/memo/edit",
      params: {
        deckId,
        deckName,
        flashcardId,
        flashcardFront,
        flashcardBack,
        tags,
      },
    });
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.push("/")}>
        <Text style={styles.headerText}>Decks</Text>
      </TouchableOpacity>
      {flashcardId && (
       <TouchableOpacity onPress={handleAddPress}>
        <Text style={styles.headerText}>Add</Text>
       </TouchableOpacity> 
      )}
      {flashcardId && (
        <TouchableOpacity onPress={handleEditPress}>
        <Text style={styles.headerText}>Edit</Text>
        </TouchableOpacity>
      )}
      {flashcardId && (
        <TouchableOpacity onPress={() =>{}}>
        <Text style={styles.headerText}>Delete</Text>
        </TouchableOpacity>
      )}
      {!flashcardId && (
        <TouchableOpacity onPress={() => router.push("/../memo/find")}>
         <Text style={styles.headerText}>Find</Text>
        </TouchableOpacity>
 
      )}
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