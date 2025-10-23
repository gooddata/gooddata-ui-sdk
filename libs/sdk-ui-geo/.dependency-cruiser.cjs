// (C) 2025 GoodData Corporation

const depCruiser = require("../../common/config/dep-cruiser/default.config");

const GeoNextOldSeparationRules = [
    {
        name: "no-next-to-old-imports",
        comment:
            "The new GeoPushpinChartNext implementation (in src/next/) must not import from the old " +
            "implementation (src/core/, src/GeoChart.ts, src/GeoPushpinChart.tsx). " +
            "This ensures complete independence between implementations. " +
            "TEMPORARY EXCEPTION: Legend components can import from old implementation until refactoring.",
        severity: "error",
        from: {
            path: "^src/next/",
            pathNot: "^src/next/components/legends/",
        },
        to: {
            path: "^src/(core/|GeoChart\\.ts|GeoPushpinChart\\.tsx)",
        },
    },
    {
        name: "no-old-to-next-imports",
        comment:
            "The old GeoPushpinChart implementation (src/core/, src/GeoChart.ts, src/GeoPushpinChart.tsx) " +
            "must not import from the new implementation (src/next/). These implementations should remain " +
            "independent.",
        severity: "error",
        from: {
            path: "^src/(core/|GeoChart\\.ts|GeoPushpinChart\\.tsx)",
        },
        to: {
            path: "^src/next/",
        },
    },
];

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        ...GeoNextOldSeparationRules,
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
