// (C) 2025-2026 GoodData Corporation

const depCruiser = require("../../common/config/dep-cruiser/default.config");

const GeoChartNextSeparationRules = [
    {
        name: "no-geoChartNext-to-geoChart-imports",
        comment:
            "The new geoChartNext pluggable implementation (in src/internal/components/pluggableVisualizations/geoChartNext/) " +
            "must not import from the old geoChart implementation. " +
            "This ensures complete independence between implementations.",
        severity: "error",
        from: {
            path: "^src/internal/components/pluggableVisualizations/geoChartNext/",
        },
        to: {
            path: "^src/internal/components/pluggableVisualizations/geoChart/",
            pathNot: "^src/internal/components/pluggableVisualizations/geoChartNext/",
        },
    },
];

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
        ...GeoChartNextSeparationRules,
        depCruiser.moduleWithDependencies("internal", "src/internal", ["src/kdaDialog/internal.ts"]),
        depCruiser.moduleWithDependencies("insightView", "src/insightView", [
            "src/dataLoaders",
            "src/dataLoaders/ColorPaletteDataLoader.ts",
            "src/dataLoaders/InsightDataLoader.ts",
            "src/dataLoaders/UserWorkspaceSettingsDataLoader.ts",
            "src/dataLoaders/WorkspacePermissionsDataLoader.ts",
            "src/internal",
            "src/internal/createRootProvider.ts",
            "src/internal/utils/embeddingCodeGenerator",
            "src/internal/utils/embeddingCodeGenerator/types.ts",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
