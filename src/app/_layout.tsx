import { Stack } from 'expo-router'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'

const Layout = (): JSX.Element => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" /> 
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  )
}

export default Layout
