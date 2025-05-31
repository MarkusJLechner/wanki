import { defineConfig } from 'eslint/config'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configs as tsConfigs } from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const baseParserOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
}

const tsParserOptions = {
  ...baseParserOptions,
  parser: tsParser,
  project: ['./tsconfig.json', './tsconfig.node.json'],
  tsconfigRootDir: __dirname,
  extraFileExtensions: ['.vue'],
}

const globalsAll = {
  ...globals.browser,
  ...globals.node,
}

const commonPlugins = {
  prettier: prettierPlugin,
}

const tsCommonPlugins = {
  '@typescript-eslint': tsPlugin,
}

const tsCommonRules = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/ban-ts-comment': [
    'off',
    {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': true,
      'ts-check': false,
      minimumDescriptionLength: 5,
    },
  ],
}

const testRules = {
  ...tsCommonRules,
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/require-await': 'off',
  quotes: 'off',
}

const tsTypeCheckedVueOverrides = tsConfigs.recommendedTypeChecked.map(
  (config) => ({
    ...config,
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: tsParserOptions,
    },
    rules: {
      ...config.rules,
      ...tsCommonRules,
    },
  }),
)

const tsTypeCheckedOverrides = tsConfigs.recommendedTypeChecked.map(
  (config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
  }),
)

export default defineConfig([
  {
    ignores: ['dist/**/*', 'build/**/*.js'],
    languageOptions: {
      parserOptions: baseParserOptions,
      globals: globalsAll,
    },
    plugins: commonPlugins,
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
      parser: vueParser,
      parserOptions: tsParserOptions,
    },
    plugins: {
      ...tsCommonPlugins,
      vue,
    },
    rules: {
      'vue/no-multiple-template-root': 'off',
      ...tsPlugin.configs.recommended.rules,
      ...tsCommonRules,
    },
  },

  ...tsTypeCheckedVueOverrides,

  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: tsParserOptions,
    },
    plugins: tsCommonPlugins,
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      ...tsCommonRules,
    },
  },

  ...tsTypeCheckedOverrides,

  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      parserOptions: baseParserOptions,
    },
  },

  {
    files: ['tests/**/*.ts'],
    rules: testRules,
  },
])
