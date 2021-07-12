const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,

        depCruiser.isolatedSubmodule("constants", "src/constants"),
        depCruiser.isolatedSubmodule("localization", "src/localization"),
        depCruiser.isolatedSubmodule("presentationComponents", "src/presentationComponents"),

        depCruiser.moduleWithDependencies("converters", "src/converters", ["src/types.ts"]),
        depCruiser.moduleWithDependencies(
            "dashboard",
            "src/dashboard/", // the trailing / is necessary here, otherwise dashboardAux is matched as well
            [
                "src/dashboardAux",
                "src/filterBar",
                "src/layout",
                "src/localization",
                "src/model",
                "src/model/state/dashboardStore.ts",
                "src/scheduledEmail",
                "src/topBar",
                "src/widget",
            ],
        ),
        depCruiser.moduleWithDependencies("dashboardAux", "src/dashboardAux", [
            "src/layout/types.ts",
            "src/model",
            "src/widget/types.ts",
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
        depCruiser.moduleWithDependencies("layout", "src/layout", [
            "src/dashboardAux",
            "src/localization",
            "src/model",
            "src/presentationComponents",
            "src/types.ts",
            "src/widget",
        ]),
        depCruiser.moduleWithDependencies("logUserInteraction", "src/logUserInteraction", ["src/model"]),
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
        depCruiser.moduleWithDependencies("widget", "src/widget", [
            "src/_staging/*",
            "src/converters",
            "src/dashboardAux",
            "src/drill",
            "src/drill/types.ts",
            "src/localization",
            "src/logUserInteraction",
            "src/model",
            "src/presentationComponents",
            "src/types.ts",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
