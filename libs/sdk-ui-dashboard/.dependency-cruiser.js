const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.moduleWithDependencies("drill", "src/drill", [
            "src/constants",
            "src/dashboardAux",
            "src/localization",
            "src/model",
            "src/model/_staging/*",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("filterBar", "src/filterBar", [
            "src/localization",
            "src/model",
            "src/model/_staging/*",
        ]),
        depCruiser.moduleWithDependencies("insight", "src/insight", [
            "src/converters",
            "src/dashboardAux",
            "src/drill",
            "src/drill/types.ts", // TODO RAIL-3383 can we avoid this?
            "src/localization",
            "src/logUserInteraction",
            "src/model",
            "src/model/_staging/*",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("kpi", "src/kpi", [
            "src/converters",
            "src/dashboardAux",
            "src/dashboardItems",
            "src/drill",
            "src/localization",
            "src/model",
            "src/model/_staging/*",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("model", "src/model", [
            "src/converters",
            "src/drill/types.ts",
            "src/layout/DefaultDashboardLayoutRenderer/index.ts", // TODO RAIL-3383 remove this after _staging moves outside of model
            "src/localization",
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
