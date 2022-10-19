// (C) 2019 GoodData Corporation
module.exports = {
    preset: "ts-jest",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testRegex: "(\\.test)\\.(tsx?)$",
    collectCoverage: false,
    moduleFileExtensions: ["ts", "js", "tsx"],
    moduleNameMapper: {
        "^[./a-zA-Z0-9$_-]+\\.svg$": "<rootDir>/__mocks__/jestSvgStub.js",
        "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.ts",
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testTimeout: 20000, // This timeout was added because we have flaky tests that ended up with timeouts. more info: https://github.com/facebook/jest/issues/11607
};
