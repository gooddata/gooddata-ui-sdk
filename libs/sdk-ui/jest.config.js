// (C) 2019 GoodData Corporation
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    testEnvironment: "enzyme",
    testEnvironmentOptions: {
        enzymeAdapter: "react16",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "jest-enzyme"],
};
