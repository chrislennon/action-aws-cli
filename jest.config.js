/* eslint-disable */
// To have different commands to run unit tests and integration tests
// https://medium.com/coding-stones/separating-unit-and-integration-tests-in-jest-f6dd301f399c
const {defaults} = require('jest-config/build/index')

module.exports = {
  'roots': [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  'transform': {
    '^.+\\.tsx?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },

  'collectCoverage': false,
  'collectCoverageFrom': [
    '**/*.ts',
    '!**/tests/**',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  'coveragePathIgnorePatterns': [
    '/node_modules/'
  ],
  'coverageThreshold': {
    'global': {
      'statements': 90,
      'branches': 50,
      'functions': 90,
      'lines': 90
    }
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],

  testEnvironment: 'node'
}
