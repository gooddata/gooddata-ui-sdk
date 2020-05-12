const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.isolatedSubmodule("internal", "src/internal"),
        depCruiser.moduleWithDependencies("insightView", "src/insightView", ["src/internal"]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
