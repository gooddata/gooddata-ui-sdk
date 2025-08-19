// (C) 2020-2025 GoodData Corporation
module.exports = {
    root: true,
    ignorePatterns: ["**/dist/**/*.*"],
    extends: ["plugin:prettier/recommended"],
    rules: {
        "no-duplicate-imports": "error",
        "import/order": "off",
        "no-restricted-imports": [
            "error",
            {
                paths: [{ name: "lodash/get", message: "Please use the ?. and ?? operators instead." }],
            },
        ],
        "import/no-unassigned-import": "error",

        // we don't mind duplicate string most of the time as they are often checked by TypeScript unions
        "sonarjs/no-duplicate-string": "off",
        // some of these findings are not actionable in a reasonable time
        "sonarjs/cognitive-complexity": "warn",
        "tsdoc/syntax": "error",
        // these rules can make some regexes much less readable
        "regexp/prefer-d": "off",
        "regexp/prefer-w": "off",
        // this rule is in direct conflict with the regexp plugin
        "no-useless-escape": "off",
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    overrides: [
        {
            plugins: ["@typescript-eslint"],
            extends: ["plugin:@typescript-eslint/recommended"],
            files: ["*.ts", "*.tsx"],
            rules: {
                "@typescript-eslint/array-type": "off",
                "@typescript-eslint/ban-ts-comment": [
                    "error",
                    { "ts-expect-error": "allow-with-description" },
                ],
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
                "@typescript-eslint/naming-convention": "off",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-inferrable-types": "off",
                "@typescript-eslint/no-non-null-assertion": "off",
                "@typescript-eslint/prefer-optional-chain": "error",
            },
        },
        {
            files: ["*.test.ts", "*.test.tsx", "*.spec.ts"],
            rules: {
                // we do not care about duplicate functions in test files, they often make sense (e.g. in different describe blocks)
                "sonarjs/no-identical-functions": "off",
            },
        },
    ],
};
