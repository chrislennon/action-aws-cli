module.exports = {
  parser:  '@typescript-eslint/parser',
  extends: [
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "no-console": 0,
    "semi": [
      "error",
      "never"
    ],
    "indent": [
      "error",
      2, {
        "SwitchCase": 1
      }
    ],
    "@typescript-eslint/semi": [
      "error",
      "never"
    ],
    "@typescript-eslint/indent": [
      "error",
      2, {
        "SwitchCase": 1
      }
    ],"@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        "allowExpressions": true
      }
    ],
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        "multiline": {
          "delimiter": "none"
        },
      }
    ],
    "@typescript-eslint/camelcase": [
      "off"
    ],
    "@typescript-eslint/no-use-before-define": [
      "off"
    ],
    "@typescript-eslint/no-unused-vars": [
      "error", {
        "argsIgnorePattern": "^_"
      }
    ]
  },
  env: {
    "jest": true
  },
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module",
  }
}
