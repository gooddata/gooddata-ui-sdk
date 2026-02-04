// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";

export default [
    ...config,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/restrict-template-expressions": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
