// (C) 2025-2026 GoodData Corporation

import { type Rules, playwrightConflicts, playwrightPlugin, playwrightRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const rules: Rules<"playwright"> = {
    ...playwrightConflicts,
    ...playwrightRules,
};

const flat = {
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
    rules,
};

export const playwright: IConfiguration<"playwright"> = {
    legacy: {
        packages: [playwrightPlugin],
        plugins: ["playwright"],
        rules,
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
