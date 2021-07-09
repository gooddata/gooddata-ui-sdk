const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.isolatedSubmodule("constants", "src/constants"),
        depCruiser.isolatedSubmodule("dashboardItems", "src/dashboardItems"),
        depCruiser.moduleWithDependencies("converters", "src/converters", ["src/types.ts"]),
        depCruiser.moduleWithDependencies("dashboardAux", "src/dashboardAux", [
            "src/model",
            "src/insight/types.ts",
            "src/kpi/types.ts",
            "src/layout/types.ts",
        ]),
        depCruiser.moduleWithDependencies("drill", "src/drill", [
            "src/_staging/*",
            "src/constants",
            "src/dashboardAux",
            "src/localization",
            "src/model",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("filterBar", "src/filterBar", [
            "src/_staging/*",
            "src/localization",
            "src/model",
        ]),
        depCruiser.moduleWithDependencies("insight", "src/insight", [
            "src/_staging/*",
            "src/converters",
            "src/dashboardAux",
            "src/drill",
            "src/drill/types.ts",
            "src/localization",
            "src/logUserInteraction",
            "src/model",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("kpi", "src/kpi", [
            "src/_staging/*",
            "src/converters",
            "src/dashboardAux",
            "src/dashboardItems",
            "src/drill",
            "src/localization",
            "src/model",
            "src/types.ts",
        ]),
        depCruiser.moduleWithDependencies("model", "src/model", [
            "src/_staging/*",
            "src/converters",
            "src/drill/types.ts",
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
