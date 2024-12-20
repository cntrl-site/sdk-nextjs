import antfu from '@antfu/eslint-config';

export default antfu(
  {
    ignores: [],
  },
  {
    rules: {
      'import/order': 'off',
      'style/semi': 'off',
      'antfu/if-newline': 'off',
      'style/comma-dangle': 'off',
      'style/member-delimiter-style': 'off',
      'semi': ['error', 'always'],
      'no-alert': 'off',
      'ts/consistent-type-definitions': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'ts/consistent-type-imports': 'off',
      'jsonc/sort-keys': 'off',
      'node/prefer-global/process': 'off',
      'style/arrow-parens': 'off',
      'ts/method-signature-style': 'off',
      'style/brace-style': 'off',
      'style/jsx-one-expression-per-line': 'off',
      'test/prefer-lowercase-title': 'off',
      'perfectionist/sort-exports': 'off',
      'no-extra-boolean-cast': 'off',
      'prefer-promise-reject-errors': 'off',
      'new-cap': 'off',
      'perfectionist/sort-named-exports': 'off',
      'style/multiline-ternary': 'off'
    },
  },
);
