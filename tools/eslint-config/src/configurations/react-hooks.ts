// (C) 2025-2026 GoodData Corporation

import { type IPackage, reactHooksRules } from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const reactHooksPlugin: IPackage = {
    name: "eslint-plugin-react-hooks",
    version: "7.1.1",
};

const flat = {
    packages: [reactHooksPlugin],
    plugins: { "react-hooks": reactHooksPlugin },
    rules: reactHooksRules,
};

export const reactHooks: IConfiguration<"react-hooks"> = {
    legacy: {
        packages: [reactHooksPlugin],
        plugins: ["react-hooks"],
        rules: reactHooksRules,
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
