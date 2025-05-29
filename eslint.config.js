import { defineConfig } from 'eslint/config'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
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

const parserOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

export default defineConfig([
  {
    ignores: ['dist/**/*', 'build/**/*.js'],
    languageOptions: {
      parserOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'prettier/prettier': 'error',
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions,
    },
    plugins: {
      vue,
    },
    rules: {
      'vue/no-multiple-template-root': 'off',
    },
  },

  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parserOptions,
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts', '**/*.vue'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ...parserOptions,
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
])
