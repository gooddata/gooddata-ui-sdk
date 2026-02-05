// (C) 2024-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react-vitest";

export default [
    ...config,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
