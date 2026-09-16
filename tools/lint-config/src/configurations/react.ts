// (C) 2025-2026 GoodData Corporation

import { Rules } from "../types.js";

export const reactRulesNativeSupported: Rules<"react"> = {
    "react/no-danger": "error",

    // turn exampleProps={true} into exampleProp
    "react/jsx-boolean-value": ["error", "never"],

    // no longer needed with new react transform
    "react/react-in-jsx-scope": "off",
};

export const reactRulesNativeNotSupported: Rules<"react"> = {
    /**
     * jsx-no-leaked-render is set to warning only because it's not working properly for the AND operator
     * within component's properties.
     */
    "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary", "coerce"] }],

    "react/function-component-definition": [
        "error",
        {
            namedComponents: "function-declaration",
            unnamedComponents: "arrow-function",
        },
    ],
};

export const reactRules: Rules<"react"> = {
    ...reactRulesNativeSupported,
    ...reactRulesNativeNotSupported,
};
