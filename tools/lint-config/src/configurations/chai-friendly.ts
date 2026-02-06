// (C) 2026 GoodData Corporation

import { IPackage } from "../types.js";

export const chaiFriendlyPlugin: IPackage = {
    name: "eslint-plugin-chai-friendly",
    version: "1.1.0",
};

export const chaiFriendlyRules = {
    "no-unused-expressions": "off",
    "chai-friendly/no-unused-expressions": "error",
};
