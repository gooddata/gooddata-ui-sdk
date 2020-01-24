// (C) 2019 GoodData Corporation
const base = require("../../common/config/jest/jest.config.base.js");
module.exports = {
    ...base,
    testRegex: "((/tests/(api-regression))|(/src)).*\\.test\\.tsx?$",
};
