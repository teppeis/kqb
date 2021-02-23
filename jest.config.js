"use strict";

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src"],
  testRegex: "\\.test\\.[jt]sx?$",
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
};
