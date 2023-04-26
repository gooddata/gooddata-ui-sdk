// (C) 2019 GoodData Corporation
const base = require("./jest.config.base.js");

module.exports = {
    ...base,
    collectCoverage: true,
    silent: true,
    collectCoverageFrom: ["src/**/*.ts", "test/**/*.ts", "!**/*.d.ts"],
    coverageDirectory: "<rootDir>/ci/results/coverage",
    coverageReporters: ["json", "cobertura", "lcov", "html"],
    testResultsProcessor: "<rootDir>/node_modules/jest-junit",
};
