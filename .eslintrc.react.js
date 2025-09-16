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

        // no longer needed with new react transform
        "react/react-in-jsx-scope": "off",

        // better tree-shaking and cleanliness
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "react",
                        importNames: ["default"],
                        message: "Default import from React is not allowed. Use named imports instead.",
                    },
                ],
            },
        ],

        "no-restricted-syntax": [
            "error",
            {
                selector: "MemberExpression[object.name='React']",
                message: "Do not use `React.*`. Use named imports instead.",
            },
        ],
    },
    overrides: [
        {
            plugins: ["@typescript-eslint"],
            files: ["*.ts", "*.tsx"],
            rules: {
                "no-restricted-syntax": [
                    "error",
                    {
                        selector: "MemberExpression[object.name='React']",
                        message: "Do not use `React.*`. Use named imports instead.",
                    },
                    {
                        selector:
                            "TSTypeReference[typeName.type='TSQualifiedName'][typeName.left.name='React']",
                        message: "Do not use `React.*` types. Use named imports instead.",
                    },
                ]
            }
        }
    ]
};
