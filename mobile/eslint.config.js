const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { files: ['jest.setup.cjs'], languageOptions: { globals: { jest: 'readonly' } } },
  { ignores: ['dist/**', 'coverage/**', 'ios/**', 'android/**'] },
]);
