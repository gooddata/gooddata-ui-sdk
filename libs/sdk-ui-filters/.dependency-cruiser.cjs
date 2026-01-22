// (C) 2026 GoodData Corporation

const depCruiser = require("../../common/config/dep-cruiser/default.config");

let options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        depCruiser.moduleWithDependencies("AttributeFilter", "src/AttributeFilter", [
            "src/constants/*",
            "src/shared/*",
        ]),
        depCruiser.moduleWithDependencies("DateFilter", "src/DateFilter", [
            "src/constants/*",
            "src/shared/*",
        ]),
        depCruiser.isolatedSubmodule("MeasureValueFilter", "src/MeasureValueFilter"),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
