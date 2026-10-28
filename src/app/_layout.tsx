import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// react-native-draggable-flatlist still passes a dependency array to
// useAnimatedStyle/useDerivedValue, which Reanimated 4 only honors on web.
// Harmless on native; silence it until the library updates.
LogBox.ignoreLogs([
  'Dependencies should only be used on the web and are always ignored on native.',
])

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
