import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default [{
  files: ['src/**/*.{js,jsx}'],
  languageOptions: {
    globals: { ...globals.browser, process: 'readonly', google: 'readonly', test: 'readonly', expect: 'readonly', vi: 'readonly' },
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: { react, 'react-hooks': hooks },
  rules: {
    ...js.configs.recommended.rules,
    'no-unused-vars': 'warn',
    'react/jsx-uses-react': 'warn',
    'react/jsx-uses-vars': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}];
