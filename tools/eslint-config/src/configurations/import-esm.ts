// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const importEsm: IConfiguration<"import-esm"> = {
    packages: [
        {
            name: "eslint-plugin-import-esm",
            version: "1.2.1",
        },
    ],
    plugin: "import-esm",
    extends: ["plugin:import-esm/recommended"],
};
