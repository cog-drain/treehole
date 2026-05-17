import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'

export default tseslint.config(
    {
        ignores: ['dist/**', 'coverage/**', 'node_modules/**']
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    prettier,
    {
        files: ['src/**/*.{js,ts,vue}', 'vite.config.ts'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.es2025,
                ...globals.node
            }
        },
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-debugger': 'warn',
            'no-empty': 'warn',
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'prefer-const': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_'
                }
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-empty-object-type': 'warn',
            '@typescript-eslint/no-unused-expressions': 'warn',
            'no-async-promise-executor': 'warn',
            'no-promise-executor-return': 'warn',
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'warn',
            'vue/require-default-prop': 'off',
            'vue/require-prop-types': 'off',
            'vue/no-mutating-props': 'warn'
        }
    },
    {
        files: ['src/**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue']
            }
        }
    },
    {
        files: ['src/**/*.test.ts', 'src/tests/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.vitest
            }
        }
    },
    {
        files: ['src/**/*.js'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
)
