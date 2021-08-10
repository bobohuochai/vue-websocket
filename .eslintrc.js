module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-else-return': "error",
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    '@typescript-eslint/no-explicit-any': 0,
    quotes: ['error', 'single'],
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'class-methods-use-this': 0,
    'import/no-extraneous-dependencies': 0,
    'no-plusplus': 0,
    'no-param-reassign': 0,
    'prefer-destructuring': 0,
    'max-len': ["error", { "code": 140 }],
    'no-restricted-syntax': 0,
    'default-case': 0,
    'consistent-return': 0,
    'import/no-dynamic-require': 0,
    'no-mixed-operators': 0,
    'import/no-cycle': 0,
    'object-curly-newline': 0,
    '@typescript-eslint/no-non-null-assertion': 0
  }
}
