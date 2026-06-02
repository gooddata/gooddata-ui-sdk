// (C) 2025-2026 GoodData Corporation

import { type IPackage } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const reactPlugin: IPackage = {
    name: "eslint-plugin-react",
    version: "7.37.5",
};

const reactHooksPlugin: IPackage = {
    name: "eslint-plugin-react-hooks",
    version: "5.2.0",
};

const commonConfiguration = {
    packages: [reactPlugin, reactHooksPlugin],
    rules: {
        "react/no-danger": "error",
        "react/prop-types": "off",
        "react/function-component-definition": [
            "error",
            {
                namedComponents: "function-declaration",
                unnamedComponents: "arrow-function",
            },
        ],
        /**
         * jsx-no-leaked-render is set to warning only because it's not working properly for the AND operator
         * within component's properties.
         */
        "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary", "coerce"] }],

        // turn exampleProps={true} into exampleProp
        "react/jsx-boolean-value": ["error", "never"],

        // no longer needed with new react transform
        "react/react-in-jsx-scope": "off",

        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};

const v9 = {
    ...commonConfiguration,
    plugins: { react: reactPlugin, "react-hooks": reactHooksPlugin },
};

export const react: IDualConfiguration = {
    v8: {
        ...commonConfiguration,
        plugins: ["react", "react-hooks"],
    },
    v9,
    ox: v9,
};
