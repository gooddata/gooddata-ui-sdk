// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm";

export default [
    ...config,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
