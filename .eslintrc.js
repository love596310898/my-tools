module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  rules: {
    // https://eslint.org/docs/rules/
    // https://eslint.org/docs/user-guide/configuring#extending-configuration-files
    'no-console': NODE_ENV === NODE_ENV_PROD ? 'warn' : 'off',
    'no-debugger': NODE_ENV === NODE_ENV_PROD ? 'warn' : 'off',
    'max-len': ['error', 200],
    'consistent-return': ['off'],
    'import/extensions': ['off'],
    'import/no-unresolved': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    'func-names': ['off'],
    'linebreak-style': ['off'],
    // https://eslint.vuejs.org/rules/#uncategorized
    'vue/comma-dangle': ['error', 'always-multiline'],
    'vue/key-spacing': ['error', {
      mode: 'strict',
      align: {
        beforeColon: false,
        afterColon: true,
        on: 'colon',
      },
    }],
    'vue/no-multi-spaces': ['error', {
      ignoreProperties: true,
    }],
    'vue/eqeqeq': ['error', 'always'],
  },
  overrides: [{
    files: [
      '**/__tests__/*.{j,t}s?(x)',
      '**/tests/unit/**/*.spec.{j,t}s?(x)',
    ],
    env: {
      mocha: true,
    },
  }],
};