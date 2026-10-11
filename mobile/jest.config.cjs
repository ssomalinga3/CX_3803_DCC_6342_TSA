module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__tests__/mocks/style.cjs',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/components/ui/collapsible.tsx', 'src/hooks/use-theme.ts'],
};
