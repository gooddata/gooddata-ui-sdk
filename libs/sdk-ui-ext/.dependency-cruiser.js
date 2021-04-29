const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depCruiser.DefaultRules.filter((rule) => rule.name !== "not-to-lodash-get"),
        // replace the default noLodashGet with our custom rule with some minimal exceptions
        depCruiser.noLodashGet([
            // used for the supported properties, part of the PlugVis API
            "src/internal/utils/propertiesHelper.ts",
            // TODO remove this once the suspicious code in the file is resolved
            "src/internal/utils/bucketHelper.ts",
        ]),

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
