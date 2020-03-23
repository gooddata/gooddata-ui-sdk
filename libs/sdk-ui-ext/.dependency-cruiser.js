const depRuiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depRuiser.DefaultRules,
        ...depRuiser.DefaultSdkRules,
        depRuiser.isolatedSubmodule("internal", "src/internal"),
        depRuiser.moduleWithDependencies("insightView", "src/insightView", ["src/internal"]),
    ],
    options: depRuiser.DefaultOptions,
};

module.exports = options;
