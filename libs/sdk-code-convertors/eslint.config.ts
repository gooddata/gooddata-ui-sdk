// (C) 2024-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-vitest";

export default [
    ...config,
    {
        ignores: ["wasm/bundle.js", "wasm/.bin/**"],
    },
];
