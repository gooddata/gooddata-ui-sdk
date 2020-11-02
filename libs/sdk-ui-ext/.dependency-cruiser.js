const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        // TODO: uncomment this line when dashboardEmbedding is no longer internal (for now this is to avoid circular dependencies)
        // depCruiser.isolatedSubmodule("internal", "src/internal"),
        depCruiser.moduleWithDependencies("insightView", "src/insightView", [
            "src/internal",
            // TODO: remove this line when dashboardEmbedding is no longer internal (for now this is to avoid circular dependencies)
            "src/internal/*",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
