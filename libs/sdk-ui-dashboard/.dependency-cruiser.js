const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.moduleWithDependencies("filterBar", "src/filterBar", [
            "src/localization",
            "src/model",
            "src/model/_staging/*",
        ]),
        depCruiser.moduleWithDependencies("insight", "src/insight", [
            "src/converters",
            "src/dashboardAux",
            "src/drill",
            "src/drill/interfaces.ts", // TODO RAIL-3383 can we avoid this?
            "src/localization",
            "src/logUserInteraction",
            "src/model",
            "src/model/_staging/*",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("scheduledEmail", "src/scheduledEmail", [
            "src/dashboardAux",
            "src/localization",
            "src/model",
        ]),
        depCruiser.moduleWithDependencies("topBar", "src/topBar", ["src/localization"]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
