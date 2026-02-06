// (C) 2025-2026 GoodData Corporation

import { importEsmPlugin, importEsmRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const importEsm: IConfiguration<"import-esm"> = {
    packages: [importEsmPlugin],
    jsPlugins: [{ name: "import-esm", specifier: importEsmPlugin.name }],
    rules: importEsmRules,
};
