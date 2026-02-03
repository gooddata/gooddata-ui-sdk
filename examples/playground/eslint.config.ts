// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    {
        rules: {
            "import-x/no-unassigned-import": "warn",
        },
    },
    tsOverride(import.meta.dirname, {
        "@typescript-eslint/no-unsafe-assignment": "warn",
    }),
];
