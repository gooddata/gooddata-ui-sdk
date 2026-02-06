// (C) 2025-2026 GoodData Corporation

import { type IPackage } from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const typescriptEslintPlugin: IPackage = {
    name: "@typescript-eslint/eslint-plugin",
    version: "8.52.0",
};

const eslintConflicts = {
    "constructor-super": "off",
    "getter-return": "off",
    "no-class-assign": "off",
    "no-const-assign": "off",
    "no-dupe-args": "off",
    "no-dupe-class-members": "off",
    "no-dupe-keys": "off",
    "no-func-assign": "off",
    "no-import-assign": "off",
    "no-new-native-nonconstructor": "off",
    "no-new-symbol": "off",
    "no-obj-calls": "off",
    "no-redeclare": "off",
    "no-setter-return": "off",
    "no-this-before-super": "off",
    "no-undef": "off",
    "no-unreachable": "off",
    "no-unsafe-negation": "off",
    "no-var": "error",
    "no-with": "off",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "no-array-constructor": "off",
    "no-unused-expressions": "off",
    "no-unused-vars": "off",
};

const commonRules = {
    "@typescript-eslint/no-array-constructor": "error",
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "@typescript-eslint/no-empty-object-type": "error",
    "@typescript-eslint/no-extra-non-null-assertion": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-unnecessary-type-constraint": "error",
    "@typescript-eslint/no-unsafe-declaration-merging": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/triple-slash-reference": "error",

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
    "@typescript-eslint/no-unused-vars": [2, { varsIgnorePattern: "^_.*$", argsIgnorePattern: "^_.*$" }],
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
        {
            selector: "ExportNamespaceSpecifier",
            message: "Usage of 'export * as …' is forbidden.",
        },
        {
            selector: "ExportAllDeclaration",
            message: "Usage of `export * from` is forbidden.",
        },
        {
            selector:
                "ImportDeclaration[source.value=/^(?!.*reference_workspace)\\./] ImportNamespaceSpecifier",
            message: "Do not use `import * as ...` from relative paths.",
        },
    ],
    "@typescript-eslint/consistent-type-imports": [
        "error",
        {
            prefer: "type-imports",
            fixStyle: "inline-type-imports",
        },
    ],
};

const packages = [
    {
        name: "@typescript-eslint/parser",
        version: "8.52.0",
    },
    typescriptEslintPlugin,
];

const commonOverride = {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    rules: {
        ...eslintConflicts,
        ...commonRules,
    },
};

const v9 = {
    packages,
    plugins: { "@typescript-eslint": typescriptEslintPlugin },
    parser: "@typescript-eslint/parser",
    languageOptions: {
        sourceType: "module" as const,
    },
    overrides: [
        {
            ...commonOverride,
            languageOptions: {
                parserOptions: {
                    projectService: true,
                },
            },
        },
    ],
};

export const typescript: IDualConfiguration<"@typescript-eslint" | "no-restricted-syntax", ""> = {
    v8: {
        packages,
        overrides: [
            {
                ...commonOverride,
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    ecmaVersion: 2022,
                    sourceType: "module",
                    projectService: true,
                },
            },
        ],
    },
    v9,
    ox: v9,
};
