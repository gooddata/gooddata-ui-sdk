const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    // Excluding PublicLibraryRules, as we are importing CSS files to the build
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules /*, ...depCruiser.PublicLibraryRules*/,
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
