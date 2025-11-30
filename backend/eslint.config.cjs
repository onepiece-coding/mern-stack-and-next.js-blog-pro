module.exports = [
  {
    // apply to TS and JS files
    files: ['**/*.ts', '**/*.js'],

    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        // remove `project` for faster lint
        // project: ['./tsconfig.json'],
      }
    },

    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },

    rules: {
      // sensible defaults
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'prefer-const': 'warn'
    },

    ignores: ['dist/**', 'node_modules/**']
  }
];