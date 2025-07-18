// (C) 2020-2025 GoodData Corporation
module.exports = {
    extends: ["./.eslintrc.js"],
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "react/prop-types": "off",
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
        "react/react-in-jsx-scope": "off", // no longer needed, since it is always (hopefully) in scope
    },
};
