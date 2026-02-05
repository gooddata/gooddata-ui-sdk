// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const reactPlugin: IPackage = {
    name: "eslint-plugin-react",
    version: "7.37.5",
};

const commonConfiguration = {
    packages: [reactPlugin],
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
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};

const v9 = {
    ...commonConfiguration,
    plugins: { react: reactPlugin },
};

export const react: IDualConfiguration<"react"> = {
    v8: {
        ...commonConfiguration,
        plugins: ["react"],
    },
    v9,
    ox: v9,
};
