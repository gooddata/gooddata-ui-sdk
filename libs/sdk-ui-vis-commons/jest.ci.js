// (C) 2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const ciBase = require("../../common/config/jest/jest.config.ci.base.js");

module.exports = {
    ...ciBase,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
