const depRuiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [...depRuiser.DefaultRules, ...depRuiser.DefaultSdkRules],
    options: depRuiser.DefaultOptions,
};

module.exports = options;
