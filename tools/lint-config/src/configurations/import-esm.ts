// (C) 2026 GoodData Corporation

import { IPackage } from "../types.js";

export const importEsmPlugin: IPackage = {
    name: "eslint-plugin-import-esm",
    version: "1.2.1",
};

export const importEsmRules = {
    "import-esm/explicit-extension": "error",
};
