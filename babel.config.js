module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',

        {
          jsxImportSource: 'nativewind',
        },
      ],
      'nativewind/babel',
    ],
      env: {
        production: {
            plugins: ['react-native-paper/babel'],
        },
      },

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      'react-native-worklets/plugin',
      'react-native-reanimated/plugin',
    ],
  };
};