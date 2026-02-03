// (C) 2026 GoodData Corporation

const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    // Excluding PublicLibraryRules, as we are importing CSS files to the build
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules /*, ...depCruiser.PublicLibraryRules*/,
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
