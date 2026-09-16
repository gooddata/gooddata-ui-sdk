// (C) 2025-2026 GoodData Corporation

import { type IPackage, reactHooksRules } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const reactHooksPlugin: IPackage = {
    name: "eslint-plugin-react-hooks",
    version: "5.2.0",
};

export const reactHooks: IDualConfiguration<"react-hooks"> = {
    v8: {
        packages: [reactHooksPlugin],
        plugins: ["react-hooks"],
        rules: reactHooksRules,
    },
    v9: {
        packages: [reactHooksPlugin],
        plugins: { "react-hooks": reactHooksPlugin },
        rules: reactHooksRules,
    },
    ox: {},
};
