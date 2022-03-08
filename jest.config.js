/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
/* https://jestjs.io/docs/configuration */
module.exports = {
  clearMocks: true,
  // collectCoverage: true,
  // collectCoverageFrom: undefined,
  // coverageDirectory: "coverage",
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],
  coverageReporters: ["json-summary", "text"],
  errorOnDeprecated: true,
  // globalSetup: undefined,
  // globalTeardown: undefined,
  // globals: {},
  // moduleFileExtensions: [
  //   "js",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],
  preset: "ts-jest",
  testEnvironment: "node",
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],
  // timers: "real"
};
