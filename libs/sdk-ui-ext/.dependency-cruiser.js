const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.isolatedSubmodule("internal", "src/internal"),
        depCruiser.moduleWithDependencies("insightView", "src/insightView", [
            "src/dataLoaders",
            "src/internal",
            // TODO: remove this line when dashboardEmbedding is no longer internal (for now this is to avoid circular dependencies)
            "src/internal/*",
        ]),
        depCruiser.moduleWithDependencies("dashboardView", "src/dashboardView", [
            "src/dataLoaders",
            "src/internal",
            "src/internal/dashboardEmbedding",
            "src/insightView/*", // we need to use some parts of insight view
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
