// (C) 2025-2026 GoodData Corporation

import { IPackage } from "../types.js";

export const cypressPlugin: IPackage = {
    name: "eslint-plugin-cypress",
    version: "3.6.0",
};

export const cypressRules = {
    "cypress/no-async-tests": "error",

    // todo: this will be nice to fixed
    "cypress/no-unnecessary-waiting": "warn",

    "cypress/no-assigning-return-values": "warn",

    // todo: this unsafe-to-chain-command needs to be set on and all problems fixed
    "cypress/unsafe-to-chain-command": "warn",
};
