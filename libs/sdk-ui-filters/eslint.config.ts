// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react-vitest";
import { tsOverride } from "@gooddata/eslint-config/tsOverride";

export default [
    ...config,
    tsOverride(import.meta.dirname, {
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
        "@typescript-eslint/no-base-to-string": "warn",
        "@typescript-eslint/unbound-method": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
    }),
];
