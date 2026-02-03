// (C) 2026 GoodData Corporation
const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [...depCruiser.DefaultRules, ...depCruiser.DefaultSdkRules],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
