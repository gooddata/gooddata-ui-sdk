// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const sonarjs: IConfiguration<"sonarjs"> = {
    packages: [
        {
            name: "eslint-plugin-sonarjs",
            version: "0.16.0",
        },
    ],
    plugins: ["sonarjs"],
    extends: ["plugin:sonarjs/recommended"],
    rules: {
        // we don't mind duplicate string most of the time as they are often checked by TypeScript unions
        "sonarjs/no-duplicate-string": "off",
        // some of these findings are not actionable in a reasonable time
        "sonarjs/cognitive-complexity": "warn",
    },
    overrides: [
        {
            files: ["*.test.ts", "*.test.tsx", "*.spec.ts"],
            rules: {
                // we do not care about duplicate functions in test files, they often make sense (e.g. in different describe blocks)
                "sonarjs/no-identical-functions": "off",
            },
        },
    ],
};
