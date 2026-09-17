// ESLint flat config (ESLint 9+) using the installed @typescript-eslint/parser
// and @typescript-eslint/eslint-plugin packages.
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierConfig = require('eslint-config-prettier');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // {} as a generic param placeholder (e.g. Request<{}, {}, Body>) is
      // idiomatic in Express and does not mean "any object" — disable this rule.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  // Prettier compat — disables rules that conflict with formatting
  {
    files: ['src/**/*.ts'],
    rules: prettierConfig.rules,
  },
];
