// (C) 2019 GoodData Corporation
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    testRegex: "/tests/(integrated).*\\.test\\.tsx?$",
    setupFiles: ["<rootDir>/integrated-test.setup.js"],
};
