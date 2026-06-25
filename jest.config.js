/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/*.test.ts"
  ],
  // Mudamos de setupFiles para setupFilesAfterEnv
  setupFilesAfterEnv: [
    "<rootDir>/src/jest.setup.ts"
  ],
  moduleNameMapper: {
    "^(\\.\\.?/.*)\\.js$": "$1",
    "^pg$": "<rootDir>/src/__mocks__/pg.ts",
    "^pg-protocol$": "<rootDir>/src/__mocks__/pg-protocol.ts"
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  transformIgnorePatterns: [
    "node_modules/(?!(pg|pg-protocol)/)"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/jest.setup.ts"
  ]
};