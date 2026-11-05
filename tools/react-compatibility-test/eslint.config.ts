// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/v10/oxlint/esm-react";

export default [
    ...config,
    {
        ignores: ["webpack.config.cjs", "vite.config.js", "scripts/refresh-md.cjs"],
    },
];
