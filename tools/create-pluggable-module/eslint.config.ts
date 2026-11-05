// (C) 2026 GoodData Corporation

import config from "@gooddata/eslint-config/v10/oxlint/esm";

export default [
    ...config,
    {
        // Template files are raw fixtures — don't lint them.
        ignores: ["src/templates/**", "esm/templates/**"],
    },
];
