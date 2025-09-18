module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 'expo-router/babel', // <-- DIHAPUS
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      // 'react-native-reanimated/plugin', // <-- DIGANTI
      'react-native-worklets/plugin', // <-- DENGAN INI
    ],
  };
};
