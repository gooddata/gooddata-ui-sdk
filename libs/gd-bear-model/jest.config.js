// (C) 2019 GoodData Corporation
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!**/*.d.ts", "!src/index.ts"],
};
