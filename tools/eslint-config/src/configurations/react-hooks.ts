// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const reactHooksPlugin: IPackage = {
    name: "eslint-plugin-react-hooks",
    version: "5.2.0",
};

const rules = {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
};

export const reactHooks: IDualConfiguration<"react-hooks"> = {
    v8: {
        packages: [reactHooksPlugin],
        plugins: ["react-hooks"],
        extends: ["plugin:react-hooks/recommended-legacy"],
        rules,
    },
    v9: {
        packages: [reactHooksPlugin],
        plugins: { "react-hooks": reactHooksPlugin },
        rules,
    },
};
