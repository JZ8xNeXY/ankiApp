// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts = config.resolver.sourceExts || []
if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs')
}

config.resolver.unstable_enablePackageExports = true

// Firebase's package exports map lacks a "react-native" condition, which
// makes Metro resolve the browser build instead of the React Native one.
// Package exports resolution works fine (and is required by Expo's own
// tooling, e.g. react-native/unstable-internals-do-not-use and the in-app
// LogBox), so only disable it for firebase packages.
const { resolveRequest: defaultResolveRequest } = config.resolver
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'firebase' || moduleName.startsWith('firebase/')) {
    const firebaseContext = { ...context, unstable_enablePackageExports: false }
    return defaultResolveRequest
      ? defaultResolveRequest(firebaseContext, moduleName, platform)
      : firebaseContext.resolveRequest(firebaseContext, moduleName, platform)
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform)
}

module.exports = config
