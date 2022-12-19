// (C) 2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "jest-enzyme"],
};
