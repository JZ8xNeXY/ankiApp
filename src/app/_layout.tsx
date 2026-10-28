import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { LogBox } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// react-native-draggable-flatlist still passes a dependency array to
// useAnimatedStyle/useDerivedValue, which Reanimated 4 only honors on web.
// Harmless on native; silence it until the library updates.
// LogBox.ignoreLogs only hides the in-app overlay, not the terminal/Metro
// log, so console.warn itself needs filtering too.
const REANIMATED_DEPS_WARNING =
  'Dependencies should only be used on the web and are always ignored on native.'

LogBox.ignoreLogs([REANIMATED_DEPS_WARNING])

const originalConsoleWarn = console.warn
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes(REANIMATED_DEPS_WARNING)) {
    return
  }
  originalConsoleWarn(...args)
}

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
