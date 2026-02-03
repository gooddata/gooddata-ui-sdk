// (C) 2024-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    tsOverride(import.meta.dirname, {
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
    }),
];
