// (C) 2026 GoodData Corporation

import { IPackage } from "../types.js";

export const noOnlyTestsPlugin: IPackage = {
    name: "eslint-plugin-no-only-tests",
    version: "3.3.0",
};

export const noOnlyTestsRules = {
    "no-only-tests/no-only-tests": ["error", { block: ["fixture"], focus: ["only"] }],
};
