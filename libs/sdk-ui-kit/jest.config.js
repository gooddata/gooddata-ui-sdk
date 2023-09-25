// (C) 2019 GoodData Corporation
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    transform: {
        "\\.js$": "babel-jest",
    },
    transformIgnorePatterns: [
        // transform esm packages so that Jest can use them
        "node_modules/(?!@gooddata|default-import|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|uuid).+\\.js$",
    ],
};
