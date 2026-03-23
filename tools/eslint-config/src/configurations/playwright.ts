// (C) 2025-2026 GoodData Corporation

import { playwrightPlugin, playwrightRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const v9 = {
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
    rules: playwrightRules,
};

export const playwright: IDualConfiguration<"playwright"> = {
    v8: {
        packages: [playwrightPlugin],
        plugins: ["playwright"],
        rules: playwrightRules,
    },
    v9,
    ox: {},
};
