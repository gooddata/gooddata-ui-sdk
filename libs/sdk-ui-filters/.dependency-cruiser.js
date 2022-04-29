const depCruiser = require("../../common/config/dep-cruiser/default.config");

let options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        depCruiser.moduleWithDependencies("AttributeFilter", "src/AttributeFilter", ["src/constants"]),
        depCruiser.moduleWithDependencies("DateFilter", "src/DateFilter", ["src/constants"]),
        depCruiser.isolatedSubmodule("MeasureValueFilter", "src/MeasureValueFilter"),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
