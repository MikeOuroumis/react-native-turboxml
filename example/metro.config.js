const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    extraNodeModules: {
      'react-native-turboxml': path.resolve(__dirname, '..'),
    },
  },
});
