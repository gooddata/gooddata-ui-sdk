// (C) 2019 GoodData Corporation
module.exports = {
    preset: "ts-jest",
    testRegex: "(\\.test)\\.(tsx?)$",
    collectCoverage: false,
    moduleFileExtensions: ["ts", "js", "tsx"],
    moduleNameMapper: {
        "^[./a-zA-Z0-9$_-]+\\.svg$": "<rootDir>/__mocks__/jestSvgStub.js",
        "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.ts",
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "jest-enzyme"],
};
