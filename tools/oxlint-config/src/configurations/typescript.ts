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
            version: "0.22.1",
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
