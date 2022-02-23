// (C) 2019 GoodData Corporation
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    preset: "ts-jest/presets/js-with-babel",
    testRegex: "/backstop/story-extractor.js$",
    setupFiles: ["<rootDir>/backstop/register-context.js"],
    moduleNameMapper: {
        "^[./a-zA-Z0-9$_-]+\\.svg$": "<rootDir>/__mocks__/jestSvgStub.js",
        "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.ts",
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "jest-enzyme"],
    // we need to give this a bit more time than the default 5000ms, it can take up to a minute on CI...
    testTimeout: 90000,
};
