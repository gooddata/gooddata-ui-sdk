// (C) 2025-2026 GoodData Corporation

import { importEsmPlugin, importEsmRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const flat = {
    packages: [importEsmPlugin],
    plugins: { "import-esm": importEsmPlugin },
    rules: importEsmRules,
};

export const importEsm: IConfiguration<"import-esm"> = {
    legacy: {
        packages: [
            {
                name: "eslint-plugin-import-esm",
                version: "1.2.1",
            },
        ],
        plugins: ["import-esm"],
        rules: importEsmRules,
    },
    flat: { v9: flat, v9ox: {}, v10: {}, v10ox: {} },
};
