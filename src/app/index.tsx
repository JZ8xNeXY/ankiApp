import { Redirect } from "expo-router";
import React from 'react'

const Index = (): JSX.Element => {
  return <Redirect href="/memo/deckScreen" />;
};

export default Index;