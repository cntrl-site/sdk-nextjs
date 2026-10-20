/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: './src',
  moduleNameMapper: {
    '^@cntrl-site/components/elements$': require.resolve('@cntrl-site/components/elements')
  }
};
