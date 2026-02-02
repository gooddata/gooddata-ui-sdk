// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    tsOverride(import.meta.dirname, {
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
    }),
];
