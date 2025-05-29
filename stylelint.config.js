export default {
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'custom-variant',
        ],
      },
    ],
    'length-zero-no-unit': null,
    'no-descending-specificity': null,
  },
}
