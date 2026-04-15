import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';
import { fileURLToPath } from 'url';
import path from 'path';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['helix-importer-ui/**', '**/*.min.js', '**/*.test.js', '**/*.spec.js', 'scripts/**'],
  },
  ...compat.extends('airbnb-base'),
  {
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        allowImportExportEverywhere: true,
        sourceType: 'module',
        requireConfigFile: false,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
      'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
      'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    },
  },
];
