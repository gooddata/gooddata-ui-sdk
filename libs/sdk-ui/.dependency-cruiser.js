const depRuiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depRuiser.DefaultRules,
        ...depRuiser.DefaultSdkRules,
        depRuiser.isolatedSubmodule("base", "src/base"),
        depRuiser.moduleWithDependencies("executions", "src/execution", ["src/base"]),
    ],
    options: depRuiser.DefaultOptions,
};

module.exports = options;
