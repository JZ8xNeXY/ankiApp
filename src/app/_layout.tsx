import { Stack } from 'expo-router'
import React from 'react'

const Layout = (): JSX.Element => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
      }}
    />
  )
}

export default Layout