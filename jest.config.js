export default {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,ts}', '!src/**/*.interface.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/', '<rootDir>/src/_index.ts'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest',
  reporters: ['default'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.spec.ts'],
};
