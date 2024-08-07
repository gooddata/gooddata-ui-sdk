const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        depCruiser.moduleWithDependencies("convertors", "src/convertors", ["src/types/*", "src/utils/*"]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
