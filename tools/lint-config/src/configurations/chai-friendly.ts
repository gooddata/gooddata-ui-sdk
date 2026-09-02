// (C) 2026 GoodData Corporation

import { IPackage, Rules } from "../types.js";

export const chaiFriendlyPlugin: IPackage = {
    name: "eslint-plugin-chai-friendly",
    version: "1.1.0",
};

export const chaiFriendlyRules: Rules = {
    "no-unused-expressions": "off",
    "chai-friendly/no-unused-expressions": "error",
};
