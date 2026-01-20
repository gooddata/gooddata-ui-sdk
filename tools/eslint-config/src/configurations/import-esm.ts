// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const importEsm: IConfiguration<"import-esm"> = {
    packages: [
        {
            name: "eslint-plugin-import-esm",
            version: "1.2.1",
        },
    ],
    plugins: ["import-esm"],
    extends: ["plugin:import-esm/recommended"],
};
