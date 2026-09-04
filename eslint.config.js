import js from '@eslint/js'
import ts from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,

  // Config files and tests run in Node, not the browser.
  {
    files: ['*.config.{js,mjs,ts}', 'tests/**/*.ts', 'scripts/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  prettier,
]
