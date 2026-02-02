// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    {
        rules: {
            "import-x/no-unassigned-import": "off",
        },
    },
    {
        ignores: [
            "webpack.config.cjs",
            "scripts/refresh-md.js",
            "configTemplates/ts/vite.config.ts",
            "configTemplates/js/vite.config.js",
        ],
    },
    tsOverride(import.meta.dirname, {
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
    }),
];
