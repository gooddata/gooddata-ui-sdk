// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const cypressPlugin: IPackage = {
    name: "eslint-plugin-cypress",
    version: "3.6.0",
};

const rules = {
    "cypress/no-async-tests": "error",

    // todo: this will be nice to fixed
    "cypress/no-unnecessary-waiting": "warn",

    "cypress/no-assigning-return-values": "warn",

    // todo: this unsafe-to-chain-command needs to be set on and all problems fixed
    "cypress/unsafe-to-chain-command": "warn",
};

const v9 = {
    packages: [cypressPlugin],
    plugins: { cypress: cypressPlugin },
    languageOptions: {
        globalsPresets: ["mocha" as const],
        globals: {
            cy: "readonly" as const,
            Cypress: "readonly" as const,
            expect: "readonly" as const,
            assert: "readonly" as const,
            chai: "readonly" as const,
        },
    },
    rules,
};

export const cypress: IDualConfiguration<"cypress"> = {
    v8: {
        packages: [cypressPlugin],
        plugins: ["cypress"],
        rules,
    },
    v9,
    ox: v9,
};
