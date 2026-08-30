import js from '@eslint/js';

const nodeGlobals = {
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setTimeout: 'readonly',
  URL: 'readonly',
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'docs/**', 'type-tests/**', '.worktrees/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: nodeGlobals,
    },
  },
  {
    files: ['demo/demo.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
      },
    },
  },
];
