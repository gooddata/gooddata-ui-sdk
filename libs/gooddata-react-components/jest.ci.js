const pkg = require('./package.json');

const config = {
    ...pkg.jest,
    "collectCoverage": true,
    "coverageDirectory": "<rootDir>/ci/results/coverage",
    "coverageReporters": ["json", "cobertura", "lcov"],
    "testResultsProcessor": "<rootDir>/node_modules/jest-junit"
};

module.exports = config;
