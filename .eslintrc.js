// (C) 2020 GoodData Corporation
module.exports = {
    root: true,
    ignorePatterns: ["**/dist/**/*.*"],
    rules: {
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
        "@typescript-eslint/ban-types": [
            "error",
            {
                types: {
                    object: false,
                },
                extendDefaults: true,
            },
        ],
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/prefer-optional-chain": "error",
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
    },
    overrides: [
        {
            files: ["*.test.ts", "*.test.tsx", "*.spec.ts"],
            rules: {
                // we do not care about duplicate functions in test files, they often make sense (e.g. in different describe blocks)
                "sonarjs/no-identical-functions": "off",
            },
        },
    ],
};
