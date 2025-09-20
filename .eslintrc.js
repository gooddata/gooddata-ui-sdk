// (C) 2020-2025 GoodData Corporation
module.exports = {
    root: true,
    ignorePatterns: ["**/dist/**/*.*"],
    plugins: ["eslint-comments"],
    extends: ["plugin:prettier/recommended"],
    rules: {
        "no-duplicate-imports": "error",
        "sort-imports": [
            "error",
            {
                ignoreCase: false,
                ignoreDeclarationSort: true,
                ignoreMemberSort: false,
            },
        ],
        "import/order": [
            "error",
            {
                pathGroups: [
                    {
                        pattern: "react",
                        group: "external",
                        position: "before",
                    },
                    {
                        pattern: "@gooddata/**",
                        group: "external",
                        position: "after",
                    },
                ],
                groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
                pathGroupsExcludedImportTypes: ["react"],
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
                "newlines-between": "always",
            },
        ],
        "no-restricted-imports": [
            "error",
            {
                patterns: [
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["get", "getOr"],
                    //     message: "Please use the ?. and ?? operators instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["keys"],
                        message: "Please use Object.keys() instead."
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["values"],
                        message: "Please use Object.values() instead."
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["entries", "toPairs"],
                        message: "Please use Object.entries() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["map"],
                    //     message: "Please use Array.prototype.map() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["filter"],
                    //     message: "Please use Array.prototype.filter() instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["find"],
                        message: "Please use Array.prototype.find() instead."
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["findIndex"],
                        message: "Please use Array.prototype.findIndex() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["includes"],
                    //     message: "Please use Array.prototype.includes() instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["some"],
                        message: "Please use Array.prototype.some() instead."
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["every"],
                        message: "Please use Array.prototype.every() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["concat"],
                    //     message: "Please use Array.prototype.concat() or spread [...arr1, ...arr2] instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["reverse"],
                        message: "Please use Array.prototype.reverse() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["slice"],
                    //     message: "Please use Array.prototype.slice() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["indexOf"],
                    //     message: "Please use Array.prototype.indexOf() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["lastIndexOf"],
                    //     message: "Please use Array.prototype.lastIndexOf() instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["fill"],
                        message: "Please use Array.prototype.fill() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["startsWith"],
                    //     message: "Please use String.prototype.startsWith() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["endsWith"],
                    //     message: "Please use String.prototype.endsWith() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["repeat"],
                    //     message: "Please use String.prototype.repeat() instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["padStart"],
                        message: "Please use String.prototype.padStart() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["padEnd"],
                    //     message: "Please use String.prototype.padEnd() instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["trim"],
                        message: "Please use String.prototype.trim() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["trimStart", "trimLeft"],
                    //     message: "Please use String.prototype.trimStart() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["trimEnd", "trimRight"],
                    //     message: "Please use String.prototype.trimEnd() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["toUpper"],
                    //     message: "Please use String.prototype.toUpperCase() instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["toLower"],
                        message: "Please use String.prototype.toLowerCase() instead."
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isArray"],
                        message: "Please use Array.isArray() instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["isNaN"],
                    //     message: "Please use Number.isNaN() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["isFinite"],
                    //     message: "Please use Number.isFinite() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["isInteger"],
                    //     message: "Please use Number.isInteger() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["isNull"],
                    //     message: "Please use value === null instead."
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["isUndefined"],
                        message: "Please use value === undefined instead."
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["defaultTo"],
                        message: "Please use value ?? defaultValue instead."
                    },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["assign"],
                    //     message: "Please use Object.assign() or spread syntax {...obj} instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["flatten"],
                    //     message: "Please use Array.prototype.flat() instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["flattenDeep"],
                    //     message: "Please use Array.prototype.flat(Infinity) instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["isNil"],
                    //     message: "Please use value === null || value === undefined instead."
                    // },
                    // {
                    //     group: ["lodash-es"],
                    //     importNames: ["noop"],
                    //     message: "Please use () => {} instead."
                    // }
                ],
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
        "no-negated-condition": "error",
        "no-unneeded-ternary": ["error", { defaultAssignment: false }],
        "no-extra-boolean-cast": "error",

        // unused disable comments
        "eslint-comments/no-unused-disable": "error",
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
