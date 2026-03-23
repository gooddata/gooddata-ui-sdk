// (C) 2025-2026 GoodData Corporation

import { playwrightPlugin, playwrightRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const playwright: IConfiguration<"playwright"> = {
    packages: [playwrightPlugin],
    jsPlugins: [{ name: "playwright", specifier: playwrightPlugin.name }],
    rules: playwrightRules,
    overrides: [
        {
            files: ["*"],
            env: {
                mocha: true,
            },
            globals: {
                expect: "readonly",
                assert: "readonly",
                chai: "readonly",
            },
        },
    ],
};
