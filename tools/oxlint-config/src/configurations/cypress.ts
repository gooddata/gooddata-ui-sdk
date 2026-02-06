// (C) 2025-2026 GoodData Corporation

import { cypressPlugin, cypressRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const cypress: IConfiguration<"cypress"> = {
    packages: [cypressPlugin],
    jsPlugins: [{ name: "cypress", specifier: cypressPlugin.name }],
    rules: cypressRules,
    overrides: [
        {
            files: ["*"],
            env: {
                mocha: true,
            },
            globals: {
                cy: "readonly",
                Cypress: "readonly",
                expect: "readonly",
                assert: "readonly",
                chai: "readonly",
            },
        },
    ],
};
