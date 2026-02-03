// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    {
        ignores: ["webpack.config.cjs", "vite.config.ts", "scripts/refresh-md.cjs"],
    },
    tsOverride(import.meta.dirname),
];
