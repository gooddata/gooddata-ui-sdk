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
            "src/dashboard/", // the trailing / is necessary here, otherwise dashboardContexts is matched as well
            [
                "src/dashboardContexts",
                "src/filterBar",
                "src/layout",
                "src/localization",
                "src/model",
                "src/scheduledEmail",
                "src/topBar",
                "src/widget",
            ],
        ),
        depCruiser.moduleWithDependencies("dashboardContexts", "src/dashboardContexts", [
            "src/layout/types.ts",
            "src/scheduledEmail/types.ts",
            "src/topBar/types.ts",
            "src/widget/types.ts",
        ]),
        depCruiser.moduleWithDependencies("drill", "src/drill", [
            "src/_staging/*",
            "src/constants",
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
            "src/dashboardContexts",
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
            "src/dashboardContexts",
            "src/localization",
            "src/model",
        ]),
        depCruiser.moduleWithDependencies("topBar", "src/topBar", [
            "src/dashboardContexts",
            "src/localization",
        ]),
        depCruiser.moduleWithDependencies("widget", "src/widget", [
            "src/_staging/*",
            "src/converters",
            "src/dashboardContexts",
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
