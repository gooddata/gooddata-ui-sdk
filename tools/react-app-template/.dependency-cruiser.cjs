const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [...depCruiser.DefaultRules, ...depCruiser.DefaultSdkRules],
    options: depCruiser.DefaultOptions,
};

module.exports = options;