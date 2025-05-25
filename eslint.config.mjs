import { defineConfig } from 'eslint/config'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        parser: '@babel/eslint-parser',
        requireConfigFile: false,
      },
    },

    extends: compat.extends(
      'plugin:vue/recommended',
      '@vue/prettier',
      'plugin:prettier/recommended',
    ),

    plugins: {
      vue,
    },

    rules: {
      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
        },
      ],

      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'prettier/prettier': ['error'],
      'vue/no-multiple-template-root': 'off',
    },
  },
])
