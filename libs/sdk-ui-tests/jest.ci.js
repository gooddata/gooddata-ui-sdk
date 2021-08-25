const ciBase = require("../../common/config/jest/jest.config.ci.base.js");

module.exports = {
    ...ciBase,
    testRegex: "((/tests/(api-regression|smoke-and-capture|_infra))|(/src)).*\\.test\\.tsx?$",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "jest-enzyme"],
};
