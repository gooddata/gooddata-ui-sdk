// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react";

export default [
    ...config,
    {
        ignores: [
            "webpack.config.cjs",
            "scripts/refresh-md.js",
            "configTemplates/ts/vite.config.ts",
            "configTemplates/js/vite.config.js",
        ],
    },
];
