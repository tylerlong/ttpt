module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript', 'plugin:@react-three/recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'prefer-const': ['error'],
    'react/no-unknown-property': ['off'], // https://github.com/jsx-eslint/eslint-plugin-react/issues/3423
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
