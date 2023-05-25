const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [...depCruiser.DefaultRules, ...depCruiser.DefaultSdkRules, ...depCruiser.PublicLibraryRules],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
