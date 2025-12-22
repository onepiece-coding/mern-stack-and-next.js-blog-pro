module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testTimeout: 20000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: 'tsconfig.jest.json', useESM: true }
    ]
  },
  extensionsToTreatAsEsm: ['.ts'],
  // Map troublesome ESM modules to your CJS mocks used in integration
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^dompurify$': '<rootDir>/tests/mocks/dompurify.cjs',
    '^jsdom$': '<rootDir>/tests/mocks/jsdom.cjs',
    '^cloudinary$': '<rootDir>/tests/mocks/cloudinary.cjs',
    '^nodemailer$': '<rootDir>/tests/mocks/nodemailer.cjs',
  },
  setupFiles: ['<rootDir>/tests/jest.env.test.cjs'],
  setupFilesAfterEnv: [
    // unit & integration setup helpers (adjust order if needed)
    '<rootDir>/tests/jest.setup.unit.ts',
    '<rootDir>/tests/jest.setup.memory.ts'
  ],
  // include both unit & integration test globs
  testMatch: [
    '**/__tests__/**/*.unit.spec.ts',
    '**/__tests__/**/*.integration.spec.ts'
  ],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,js}',
    '!src/**/types/**',
    '!src/**/test-**',
    '!src/**/__tests__/**',
    '!src/**/mocks/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};