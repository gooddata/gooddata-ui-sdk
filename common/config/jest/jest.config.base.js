// (C) 2019 GoodData Corporation
module.exports = {
    preset: "ts-jest",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testRegex: "(\\.test)\\.(tsx?)$",
    collectCoverage: false,
    moduleFileExtensions: ["ts", "js", "tsx"],
    moduleNameMapper: {
        "^[./a-zA-Z0-9$_-]+\\.svg$": "<rootDir>/jestSvgStub.js",
        "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.ts",
    },
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    globals: {
        "ts-jest": {
            packageJson: "<rootDir>/package.json",
        },
    },
};
