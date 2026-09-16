// (C) 2025-2026 GoodData Corporation

import { type IPackage, reactRules, reactRulesNativeNotSupported } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const reactPlugin: IPackage = {
    name: "eslint-plugin-react",
    version: "7.37.5",
};

const settings = {
    react: {
        version: "detect",
    },
};

export const react: IDualConfiguration<"react"> = {
    v8: {
        packages: [reactPlugin],
        plugins: ["react"],
        settings,
        rules: reactRules,
    },
    v9: {
        packages: [reactPlugin],
        plugins: { react: reactPlugin },
        settings,
        rules: reactRules,
    },
    ox: {
        packages: [reactPlugin],
        plugins: { react: reactPlugin },
        settings,
        rules: reactRulesNativeNotSupported,
    },
};
