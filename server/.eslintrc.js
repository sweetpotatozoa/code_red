module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true,
    commonjs: true,
    jest: true,
  },
  parser: '@babel/eslint-parser',
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  ignorePatterns: ['**/_next/'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'no-unused-vars': 'warn',
    'no-use-before-define': 'off',
    'no-console': 'off',
    'no-shadow': 'off',
    'import/order': 'off',
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    'no-param-reassign': 'off',
    'guard-for-in': 'off',
    'prefer-destructuring': ['error', { object: false, array: false }],
  },
}
