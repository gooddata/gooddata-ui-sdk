// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

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
    ],
};

export const ignore: IDualConfiguration = {
    v8: commonConfiguration,
    v9: commonConfiguration,
};
