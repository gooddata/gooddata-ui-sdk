// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const importEsmPlugin: IPackage = {
    name: "eslint-plugin-import-esm",
    version: "1.2.1",
};

export const importEsm: IDualConfiguration<"import-esm"> = {
    v8: {
        packages: [importEsmPlugin],
        plugins: ["import-esm"],
        extends: ["plugin:import-esm/recommended"],
    },
    v9: {
        packages: [importEsmPlugin],
        plugins: { "import-esm": importEsmPlugin },
        rules: {
            "import-esm/explicit-extension": "error",
        },
    },
};
