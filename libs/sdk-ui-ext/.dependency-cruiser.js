const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        // sdk-ui-ext relies on string based paths heavily, refactoring is not feasible now (especially because of supportedProperties spec)
        ...depCruiser.DefaultRules.filter((rule) => rule.name !== "not-to-lodash-get"),
        ...depCruiser.DefaultSdkRules,
        depCruiser.isolatedSubmodule("internal", "src/internal"),
        depCruiser.moduleWithDependencies("insightView", "src/insightView", [
            "src/dataLoaders",
            "src/internal",
        ]),
        depCruiser.moduleWithDependencies("dashboardView", "src/dashboardView", [
            "src/dataLoaders",
            "src/internal",
            "src/insightView/*", // we need to use some parts of insight view
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
