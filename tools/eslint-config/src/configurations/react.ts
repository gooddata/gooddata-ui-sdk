// (C) 2025-2026 GoodData Corporation

import {
    type IPackage,
    reactHooksRules,
    reactRules,
    reactRulesNativeNotSupported,
} from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const reactPlugin: IPackage = {
    name: "eslint-plugin-react",
    version: "7.37.5",
};

const reactHooksPlugin: IPackage = {
    name: "eslint-plugin-react-hooks",
    version: "5.2.0",
};

const settings = {
    react: {
        version: "detect",
    },
};

export const react: IDualConfiguration<"react" | "react-hooks"> = {
    v8: {
        packages: [reactPlugin, reactHooksPlugin],
        plugins: ["react", "react-hooks"],
        settings,
        rules: {
            ...reactRules,
            ...reactHooksRules,
        },
    },
    v9: {
        packages: [reactPlugin, reactHooksPlugin],
        plugins: { react: reactPlugin, "react-hooks": reactHooksPlugin },
        settings,
        rules: {
            ...reactRules,
            ...reactHooksRules,
        },
    },
    ox: {
        packages: [reactPlugin],
        plugins: { react: reactPlugin },
        settings,
        rules: reactRulesNativeNotSupported,
    },
};
