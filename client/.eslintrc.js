module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended',
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      parser: '@babel/eslint-parser',
      requireConfigFile: false,
    },
    rules: {
    },
  };