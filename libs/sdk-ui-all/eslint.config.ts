// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    tsOverride(import.meta.dirname),
    {
        rules: {
            "import-x/export": "warn",
        },
    },
];
