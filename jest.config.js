module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['**/*.mjs', '!**/*.test.mjs'],
  coverageDirectory: 'test-output',
  coverageReporters: ['text-summary', 'lcov'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test-output/',
    '<rootDir>/test/',
    '<rootDir>/jest.config.js'
  ],
  modulePathIgnorePatterns: ['node_modules'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: 'test-output',
        outputName: 'junit.xml'
      }
    ]
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: [],
  setupFilesAfterEnv: ['./jest.setup.js'],
  verbose: true,
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest'
  }
}
