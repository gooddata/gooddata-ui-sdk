// (C) 2026 GoodData Corporation

import { IPackage, Rules } from "../types.js";

export const importEsmPlugin: IPackage = {
    name: "eslint-plugin-import-esm",
    version: "1.2.1",
};

export const importEsmRules: Rules<"import-esm"> = {
    "import-esm/explicit-extension": "error",
};
