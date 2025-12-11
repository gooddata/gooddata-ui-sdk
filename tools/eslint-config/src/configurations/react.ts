// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const react: IConfiguration<"react"> = {
    packages: [
        {
            name: "eslint-plugin-react",
            version: "7.37.5",
        },
    ],
    plugin: "react",
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
