import { Redirect } from "expo-router";
import React from 'react'

const Index = (): JSX.Element => {
  // return <Redirect href="/memo/deckScreen" />;
  return <Redirect href="/auth/logIn" />;
};

export default Index;