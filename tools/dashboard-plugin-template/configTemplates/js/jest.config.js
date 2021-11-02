// (C) 2019 GoodData Corporation
module.exports = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "jest-enzyme"],
    testRegex: "(\\.test)\\.(jsx?)$",
    collectCoverage: false,
    moduleFileExtensions: ["js", "jsx"],
    moduleNameMapper: {
        "^[./a-zA-Z0-9$_-]+\\.svg$": "<rootDir>/__mocks__/jestSvgStub.js",
        "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.ts",
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
};
