module.exports = {
  preset: 'jest-expo',
  resolver: 'react-native-worklets/jest/resolver.js',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|standard-navigation' +
      '|@sentry/react-native' +
      '|native-base' +
      '|react-native-svg' +
      '|firebase' +
      '|@firebase)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
