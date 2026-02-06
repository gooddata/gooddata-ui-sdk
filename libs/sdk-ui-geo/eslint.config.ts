// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react-vitest";

export default [
    ...config,
    {
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "maplibre-gl",
                            message: "Import MapLibre types via layers/common/mapFacade.ts",
                        },
                    ],
                    patterns: [
                        {
                            group: ["maplibre-gl/*"],
                            message: "Import MapLibre types via layers/common/mapFacade.ts",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/next/layers/common/mapFacade.ts", "src/next/layers/mapRendering/mapInitialization.ts"],
        rules: {
            "no-restricted-imports": "warn",
        },
    },
];
