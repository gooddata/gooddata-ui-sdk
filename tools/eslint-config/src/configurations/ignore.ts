// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

const commonConfiguration = {
    ignorePatterns: [
        "**/dist/**/*.*",
        "**/esm/**/*.*",
        "**/node_modules/**/*.*",

        // CI results
        "**/ci/results/**",

        // Generated files
        "**/__version.ts",

        // E2E (sdk-ui-tests-e2e)
        "**/cypress/results/**",
        "**/cypress/screenshots/**",
        "**/cypress/videos/**",

        // Temp files
        "**/temp/**",

        // Reference workspaces
        "**/reference_workspace/**",
    ],
};

export const ignore: IConfiguration = {
    legacy: commonConfiguration,
    flat: {
        v9: commonConfiguration,
        v9ox: commonConfiguration,
        v10: commonConfiguration,
        v10ox: commonConfiguration,
    },
};
