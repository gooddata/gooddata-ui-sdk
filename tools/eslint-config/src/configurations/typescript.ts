// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const typescript: IConfiguration = {
    packages: [
        {
            name: "@typescript-eslint/parser",
            version: "8.52.0",
        },
        {
            name: "@typescript-eslint/eslint-plugin",
            version: "8.52.0",
        },
    ],
    override: {
        parser: "@typescript-eslint/parser",
        files: ["**/*.ts", "**/*.tsx"],
        extends: ["plugin:@typescript-eslint/recommended-type-checked"],
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": 0,
            "@typescript-eslint/no-use-before-define": 0,
            "@typescript-eslint/no-empty-function": 0,
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "interface",
                    format: ["PascalCase"],
                    custom: {
                        regex: "^I[A-Z]",
                        match: true,
                    },
                },
            ],
            "@typescript-eslint/no-unused-vars": [
                2,
                { varsIgnorePattern: "^_.*$", argsIgnorePattern: "^_.*$" },
            ],
            "@typescript-eslint/no-explicit-any": "error",

            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
            "@typescript-eslint/no-wrapper-object-types": "error",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        String: {
                            message: "Use 'string' instead",
                            fixWith: "string",
                        },
                        Number: {
                            message: "Use 'number' instead",
                            fixWith: "number",
                        },
                        Boolean: {
                            message: "Use 'boolean' instead",
                            fixWith: "boolean",
                        },
                        Symbol: {
                            message: "Use 'symbol' instead",
                            fixWith: "symbol",
                        },
                    },
                },
            ],
            "@typescript-eslint/consistent-type-exports": [
                "error",
                { fixMixedExportsWithInlineTypeSpecifier: false },
            ],
            "@typescript-eslint/explicit-member-accessibility": "off",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/member-ordering": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/prefer-optional-chain": "error",

            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.name='React']",
                    message: "Do not use `React.*`. Use named imports instead.",
                },
                {
                    selector: "TSTypeReference[typeName.type='TSQualifiedName'][typeName.left.name='React']",
                    message: "Do not use `React.*` types. Use named imports instead.",
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    prefer: "type-imports",
                    fixStyle: "inline-type-imports",
                },
            ],
        },
    },
};
