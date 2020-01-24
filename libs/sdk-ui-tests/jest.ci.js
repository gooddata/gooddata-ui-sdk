const ciBase = require("../../common/config/jest/jest.config.ci.base.js");

module.exports = {
    ...ciBase,
    testRegex: "((/tests/(api-regression))|(/src)).*\\.test\\.tsx?$",
};
