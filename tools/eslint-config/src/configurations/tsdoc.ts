// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const tsdoc: IConfiguration = {
    packages: [
        {
            name: "eslint-plugin-tsdoc",
            version: "0.2.14",
        },
        {
            name: "eslint-plugin-jsdoc",
            version: "62.1.0",
        },
    ],
    overrides: [
        {
            parser: "@typescript-eslint/parser",
            files: ["**/*.ts", "**/*.tsx"],
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
            },
            plugins: ["tsdoc", "jsdoc"],
            settings: {
                jsdoc: {
                    mode: "typescript",
                },
            },
            rules: {
                "tsdoc/syntax": "error",

                // Completeness: if there's a docblock, all params must be documented
                "jsdoc/require-param": [
                    "error",
                    {
                        contexts: [
                            { context: "FunctionDeclaration", comment: 'JsdocBlock > JsdocTag[tag="param"]' },
                            { context: "FunctionExpression", comment: 'JsdocBlock > JsdocTag[tag="param"]' },
                            {
                                context: "ArrowFunctionExpression",
                                comment: 'JsdocBlock > JsdocTag[tag="param"]',
                            },
                            { context: "MethodDefinition", comment: 'JsdocBlock > JsdocTag[tag="param"]' },
                        ],
                    },
                ],

                // TSDoc style usually doesn't put JSDoc `{type}` after @param
                "jsdoc/require-param-type": "off",
            },
        },
    ],
};
