// (C) 2023 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const ciBase = require("../../common/config/jest/jest.config.ci.base.js");

module.exports = {
    ...ciBase,
    testRegex: "((/tests/(api-regression|smoke-and-capture|_infra))|(/src)).*\\.test\\.tsx?$",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
