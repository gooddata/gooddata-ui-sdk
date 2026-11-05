// (C) 2024-2026 GoodData Corporation

import config from "@gooddata/eslint-config/v10/oxlint/esm-vitest";

export default [
    ...config,
    {
        ignores: ["wasm/bundle.js", "wasm/.bin/**"],
    },
];
