// (C) 2025-2026 GoodData Corporation

import { IOverride, Rules } from "../types.js";

export const importXRules: Rules = {
    named: "error",
    namespace: "error",
    default: "error",
    export: "error",
    "no-named-as-default": "warn",
    "no-named-as-default-member": "warn",
    "no-duplicates": "warn",
    "no-unassigned-import": ["error", { allow: ["**/*.css", "**/*.scss"] }],
};

export const importXOverrides: IOverride[] = [
    {
        files: ["**/vitest.setup.ts", "**/vitest.setup.tsx"],
        rules: {
            "no-unassigned-import": "off",
        },
    },
];
