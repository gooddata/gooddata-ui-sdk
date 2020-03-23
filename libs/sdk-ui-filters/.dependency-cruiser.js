const depRuiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depRuiser.DefaultRules,
        ...depRuiser.DefaultSdkRules,
        depRuiser.isolatedSubmodule("AttributeFilter", "src/AttributeFilter"),
        depRuiser.isolatedSubmodule("DateFilter", "src/DateFilter"),
        depRuiser.isolatedSubmodule("MeasureValueFilter", "src/MeasureValueFilter"),
    ],
    options: depRuiser.DefaultOptions,
};

module.exports = options;
