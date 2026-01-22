// (C) 2026 GoodData Corporation

const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        depCruiser.isolatedSubmodule("base", "src/base"),
        depCruiser.moduleWithDependencies("executions", "src/execution", [
            "src/base/errors/*",
            "src/base/react/*",
            "src/base/results/*",
            "src/base/vis/*",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
