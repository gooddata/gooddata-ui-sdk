// (C) 2025-2026 GoodData Corporation

import { type IPackage, reactRules, reactRulesNativeNotSupported } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const reactPlugin: IPackage = {
    name: "eslint-plugin-react",
    version: "7.37.5",
};

const commonConfiguration = {
    packages: [reactPlugin],
    settings: {
        react: {
            version: "detect",
        },
    },
};

const flat = {
    ...commonConfiguration,
    plugins: { react: reactPlugin },
    rules: reactRules,
};

const ox = {
    ...commonConfiguration,
    plugins: { react: reactPlugin },
    rules: reactRulesNativeNotSupported,
};

export const react: IConfiguration<"react"> = {
    legacy: {
        ...commonConfiguration,
        plugins: ["react"],
        rules: reactRules,
    },
    flat: { v9: flat, v9ox: ox, v10: {}, v10ox: {} },
};
