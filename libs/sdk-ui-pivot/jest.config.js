// (C) 2019 GoodData Corporation
process.env = Object.assign(process.env, { NODE_ICU_DATA: "node_modules/full-icu" });
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    /*
     * cannot use jest-environment-enzyme nor latest jsdom from Jest 25.
     *
     * see: https://github.com/ag-grid/ag-grid/issues/3488
     */
    testEnvironment: "jest-environment-jsdom-fourteen",
    testEnvironmentOptions: {
        enzymeAdapter: "react16",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "jest-enzyme"],
};
