// (C) 2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm";

export default [
    ...config,
    {
        // CLI tool: console output is the primary user interface.
        rules: {
            "no-console": "off",
        },
    },
    {
        // Template files are raw fixtures — don't lint them.
        ignores: ["src/templates/**", "esm/templates/**"],
    },
];
