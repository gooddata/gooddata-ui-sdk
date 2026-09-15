// (C) 2026 GoodData Corporation

import {
    typescriptConflictsNativeSupported,
    typescriptOverrideFiles,
    typescriptRulesNativeSupported,
} from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const typescript: IConfiguration = {
    packages: [
        {
            name: "oxlint-tsgolint",
            version: "7.0.2001",
        },
    ],
    plugins: ["typescript"],
    overrides: [
        {
            files: typescriptOverrideFiles,
            rules: {
                ...typescriptConflictsNativeSupported,
                ...typescriptRulesNativeSupported,
            },
        },
    ],
};
