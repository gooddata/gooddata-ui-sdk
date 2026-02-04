// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react";

export default [
    ...config,
    {
        ignores: ["webpack.config.cjs", "vite.config.ts", "scripts/refresh-md.cjs"],
    },
];
