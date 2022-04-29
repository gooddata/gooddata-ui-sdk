const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        ...depCruiser.DefaultRules.filter((rule) => rule.name !== "not-to-lodash-get"),
        // replace the default noLodashGet with our custom rule with some minimal exceptions
        depCruiser.noLodashGet([
            // used for the supported properties, part of the PlugVis API
            "src/internal/utils/propertiesHelper.ts",
        ]),

        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        depCruiser.isolatedSubmodule("internal", "src/internal"),
        depCruiser.moduleWithDependencies("insightView", "src/insightView", [
            "src/dataLoaders",
            "src/internal",
            "src/internal/utils/embeddingCodeGenerator",
            "src/internal/utils/embeddingCodeGenerator/types.ts",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
