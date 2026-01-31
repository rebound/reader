import css from '@eslint/css'
import jsEslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import pluginImport from 'eslint-plugin-import'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginPrettier from 'eslint-plugin-prettier/recommended'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginTestingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'
import { tailwind4 } from 'tailwind-csstree'
import * as tsEslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['node_modules', 'build', '.react-router']),
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js', '*.mjs', '*.ts', '*.tsx'] },
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.builtin,
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.css'],
    language: 'css/css',
    plugins: { css },
    languageOptions: {
      customSyntax: tailwind4,
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: tsEslint.parser,
    },
    extends: [
      jsEslint.configs.recommended,
      tsEslint.configs.strictTypeChecked,
      tsEslint.configs.stylisticTypeChecked,
      pluginReact.configs.flat['jsx-runtime'],
      pluginReact.configs.flat.recommended,
      pluginReactHooks.configs.flat['recommended-latest'],
      pluginJsxA11y.flatConfigs.recommended,
      pluginImport.flatConfigs.recommended,
      pluginImport.flatConfigs.react,
      pluginImport.flatConfigs.typescript,
      pluginPrettier,
    ],
    settings: {
      react: {
        defaultVersion: '19',
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'import/extensions': [
        'error',
        'always',
        {
          ignorePackages: true,
          checkTypeImports: true,
        },
      ],
      'import/no-unresolved': ['error', { ignore: ['^virtual:'] }],
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroups: [
            {
              pattern: '@/',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/prefer-default-export': 'off',
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-unsafe-member-access': ['error', { allowOptionalChaining: true }],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['**/*.test.{js,mjs,cjs,ts,jsx,tsx}'],
    ...pluginTestingLibrary.configs['flat/react'],
  },
)
