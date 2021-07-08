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
        depCruiser.moduleWithDependencies("scheduledEmail", "src/scheduledEmail", [
            // TODO: RAIL-3383 this hook should probably live somewhere else
            "src/dashboard/useDashboardCommandProcessing.ts",
            "src/localization",
            "src/model",
        ]),
        depCruiser.moduleWithDependencies("topBar", "src/topBar", ["src/localization"]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
