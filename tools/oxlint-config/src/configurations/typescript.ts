// (C) 2026 GoodData Corporation

import {
    typescriptConflicts,
    typescriptOverrideFiles,
    typescriptRulesNativeSupported,
} from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const typescript: IConfiguration = {
    packages: [
        {
            name: "oxlint-tsgolint",
            version: "0.11.4",
        },
    ],
    plugins: ["typescript"],
    overrides: [
        {
            files: typescriptOverrideFiles,
            rules: {
                ...typescriptConflicts,
                ...typescriptRulesNativeSupported,
            },
        },
    ],
};
