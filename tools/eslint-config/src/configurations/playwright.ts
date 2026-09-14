// (C) 2025-2026 GoodData Corporation

import { playwrightConflicts, playwrightPlugin, playwrightRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

export const playwright: IDualConfiguration<"playwright"> = {
    v8: {
        packages: [playwrightPlugin],
        plugins: ["playwright"],
        rules: {
            ...playwrightConflicts,
            ...playwrightRules,
        },
    },
    v9: {
        packages: [playwrightPlugin],
        plugins: { playwright: playwrightPlugin },
        languageOptions: {
            globalsPresets: ["mocha" as const],
            globals: {
                expect: "readonly" as const,
                assert: "readonly" as const,
                chai: "readonly" as const,
            },
        },
        rules: {
            ...playwrightConflicts,
            ...playwrightRules,
        },
    },
    ox: {},
};
