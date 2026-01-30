// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const cypressPlugin: IPackage = {
    name: "eslint-plugin-cypress",
    version: "3.6.0",
};

const commonRules = {
    // todo: this will be nice to fixed
    "cypress/no-unnecessary-waiting": "warn",

    "cypress/no-assigning-return-values": "warn",

    // todo: this unsafe-to-chain-command needs to be set on and all problems fixed
    "cypress/unsafe-to-chain-command": "warn",
};

export const cypress: IDualConfiguration<"cypress"> = {
    v8: {
        packages: [cypressPlugin],
        plugins: ["cypress"],
        extends: ["plugin:cypress/recommended"],
        rules: commonRules,
    },
    v9: {
        packages: [cypressPlugin],
        plugins: { cypress: cypressPlugin },
        languageOptions: {
            globalsPresets: ["mocha"],
            globals: {
                cy: "readonly",
                Cypress: "readonly",
                expect: "readonly",
                assert: "readonly",
                chai: "readonly",
            },
        },
        rules: {
            "cypress/no-assigning-return-values": "error",
            "cypress/no-unnecessary-waiting": "error",
            "cypress/no-async-tests": "error",
            "cypress/unsafe-to-chain-command": "error",
            ...commonRules,
        },
    },
};
