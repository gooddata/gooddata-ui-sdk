// (C) 2019 GoodData Corporation
process.env = Object.assign(process.env, { NODE_ICU_DATA: "node_modules/full-icu" });
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
