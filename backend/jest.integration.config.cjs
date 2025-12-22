module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: 'tsconfig.jest.json', useESM: true }
    ]
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^dompurify$': '<rootDir>/tests/mocks/dompurify.cjs',
    '^jsdom$': '<rootDir>/tests/mocks/jsdom.cjs',
    '^cloudinary$': '<rootDir>/tests/mocks/cloudinary.cjs',
    '^nodemailer$': '<rootDir>/tests/mocks/nodemailer.cjs',
  },
  setupFiles: ['<rootDir>/tests/jest.env.test.cjs'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.memory.ts'],
  testMatch: ['**/__tests__/**/*.integration.spec.ts']
};