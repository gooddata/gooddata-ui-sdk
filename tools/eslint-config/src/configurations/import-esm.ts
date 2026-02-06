// (C) 2025-2026 GoodData Corporation

import { importEsmPlugin, importEsmRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const v9 = {
    packages: [importEsmPlugin],
    plugins: { "import-esm": importEsmPlugin },
    rules: importEsmRules,
};

export const importEsm: IDualConfiguration<"import-esm"> = {
    v8: {
        packages: [importEsmPlugin],
        plugins: ["import-esm"],
        rules: importEsmRules,
    },
    v9,
    ox: {},
};
