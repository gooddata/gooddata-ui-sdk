// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react";

export default [
    ...config,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },
];
