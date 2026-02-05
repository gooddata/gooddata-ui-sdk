// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const importEsmPlugin: IPackage = {
    name: "eslint-plugin-import-esm",
    version: "1.2.1",
};

const rules = {
    "import-esm/explicit-extension": "error",
};

const v9 = {
    packages: [importEsmPlugin],
    plugins: { "import-esm": importEsmPlugin },
    rules,
};

export const importEsm: IDualConfiguration<"import-esm"> = {
    v8: {
        packages: [importEsmPlugin],
        plugins: ["import-esm"],
        rules,
    },
    v9,
    ox: v9,
};
