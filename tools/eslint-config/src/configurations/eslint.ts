// (C) 2025-2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

// Lodash-es imports that should be replaced with native alternatives
// Maps import name(s) to the recommended alternative
const lodashEsBans: Record<string, string> = {
    "get,getOr": "the ?. and ?? operators",
    keys: "Object.keys()",
    values: "Object.values()",
    "entries,toPairs": "Object.entries()",
    map: "Array.prototype.map()",
    flatMap: "Array.prototype.flatMap()",
    filter: "Array.prototype.filter()",
    find: "Array.prototype.find()",
    findIndex: "Array.prototype.findIndex()",
    includes: "Array.prototype.includes()",
    some: "Array.prototype.some()",
    every: "Array.prototype.every()",
    concat: "Array.prototype.concat() or spread [...arr1, ...arr2]",
    reverse: "Array.prototype.reverse()",
    slice: "Array.prototype.slice()",
    indexOf: "Array.prototype.indexOf()",
    lastIndexOf: "Array.prototype.lastIndexOf()",
    fill: "Array.prototype.fill()",
    startsWith: "String.prototype.startsWith()",
    endsWith: "String.prototype.endsWith()",
    repeat: "String.prototype.repeat()",
    padStart: "String.prototype.padStart()",
    padEnd: "String.prototype.padEnd()",
    trim: "String.prototype.trim()",
    "trimStart,trimLeft": "String.prototype.trimStart()",
    "trimEnd,trimRight": "String.prototype.trimEnd()",
    toUpper: "String.prototype.toUpperCase()",
    toLower: "String.prototype.toLowerCase()",
    isArray: "Array.isArray()",
    isNaN: "Number.isNaN()",
    isFinite: "Number.isFinite()",
    isInteger: "Number.isInteger()",
    isNull: "value === null",
    isUndefined: "value === undefined",
    defaultTo: "value ?? defaultValue",
    assign: "Object.assign() or spread syntax {...obj}",
    flatten: "Array.prototype.flat()",
    flattenDeep: "Array.prototype.flat(Infinity)",
    isNil: "value === null || value === undefined",
    noop: "() => {}",
    identity: "x => x",
    "first,head": "Array.prototype.at(0)",
    last: "Array.prototype.at(-1)",
    forEach: "Array.prototype.forEach()",
    fromPairs: "Object.fromEntries()",
    join: "Array.prototype.join()",
    isDate: "val instanceof Date",
    isFunction: "typeof val === 'function'",
    isNumber: "typeof val === 'number'",
    isObject: "val !== null && typeof val === 'object'",
    isString: "typeof val === 'string'",
    toString: "String(val)",
    "flow,flowRight": "refactoring your code",
};

const lodashEsPatterns = Object.entries(lodashEsBans).map(([importNames, alternative]) => ({
    group: ["lodash-es"],
    importNames: importNames.split(","),
    message: `Please use ${alternative} instead.`,
}));

const restrictedImportPaths = [
    {
        name: "react",
        importNames: ["default"],
        message: "Default import from React is not allowed. Use named imports instead.",
    },
    {
        name: "@gooddata/sdk-ui-kit",
        importNames: ["Icon"],
        message: "The Icon export cannot be tree-shaken, use {IconName}Icon imports instead.",
    },
    {
        name: "vitest",
        importNames: ["test"],
        message: "Use 'it' instead of 'test' for consistency.",
    },
];

export const eslint: IConfiguration = {
    extends: ["eslint:recommended"],
    rules: {
        "no-console": [2, { allow: ["warn", "error"] }],
        "no-restricted-exports": [
            2,
            {
                restrictDefaultExports: {
                    direct: true,
                    named: true,
                    defaultFrom: true,
                    namedFrom: true,
                    namespaceFrom: true,
                },
            },
        ],
        "no-duplicate-imports": ["error", { includeExports: true }],
        "no-restricted-imports": [
            "error",
            {
                paths: restrictedImportPaths,
                patterns: lodashEsPatterns,
            },
        ],
        "no-restricted-syntax": [
            "error",
            {
                selector: "MemberExpression[object.name='React']",
                message: "Do not use `React.*`. Use named imports instead.",
            },
        ],
        "sort-imports": [
            "error",
            { ignoreCase: false, ignoreDeclarationSort: true, ignoreMemberSort: false },
        ],

        // this rule is in direct conflict with the regexp plugin
        "no-useless-escape": "off",

        "no-negated-condition": "error",
        "no-unneeded-ternary": ["error", { defaultAssignment: false }],
        "no-extra-boolean-cast": "error",
        "no-unexpected-multiline": "off",
        "no-warning-comments": [
            "warn",
            {
                terms: ["todo"],
                location: "start",
            },
        ],
    },
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx"],
            excludedFiles: [
                "**/vitest.config.ts",
                "**/vitest.*.config.ts",
                "**/vitest.setup.ts",
                "**/vitest.setup.tsx",
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/*.test.utils.ts",
                "**/*.test.utils.tsx",
                "**/*.test.helpers.ts",
                "**/*.test.helpers.tsx",
            ],
            rules: {
                "no-restricted-imports": [
                    "error",
                    {
                        paths: restrictedImportPaths,
                        patterns: [
                            ...lodashEsPatterns,
                            {
                                group: ["vitest"],
                                message: "Importing from vitest is only allowed in test files.",
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
