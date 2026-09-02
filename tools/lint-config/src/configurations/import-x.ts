// (C) 2025-2026 GoodData Corporation

import { Rules } from "../types.js";

export const importXRules: Rules = {
    named: "error",
    namespace: "error",
    default: "error",
    export: "error",
    "no-named-as-default": "warn",
    "no-named-as-default-member": "warn",
    "no-duplicates": "warn",
    "no-unassigned-import": "error",
};
