// (C) 2025-2026 GoodData Corporation

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
        name: "react-dom",
        importNames: ["default"],
        message: "Default import from React DOM is not allowed. Use named imports instead.",
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

const eslintRulesCommon = {
    "constructor-super": "error",
    "for-direction": "error",
    "getter-return": "error",
    "no-async-promise-executor": "error",
    "no-case-declarations": "error",
    "no-class-assign": "error",
    "no-compare-neg-zero": "error",
    "no-cond-assign": "error",
    "no-const-assign": "error",
    "no-constant-binary-expression": "error",
    "no-constant-condition": "error",
    "no-control-regex": "error",
    "no-debugger": "error",
    "no-delete-var": "error",
    "no-dupe-args": "error",
    "no-dupe-class-members": "error",
    "no-dupe-else-if": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty": "error",
    "no-empty-character-class": "error",
    "no-empty-pattern": "error",
    "no-empty-static-block": "error",
    "no-ex-assign": "error",
    "no-fallthrough": "error",
    "no-func-assign": "error",
    "no-global-assign": "error",
    "no-import-assign": "error",
    "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error",
    "no-loss-of-precision": "error",
    "no-misleading-character-class": "error",
    "no-new-native-nonconstructor": "error",
    "no-nonoctal-decimal-escape": "error",
    "no-obj-calls": "error",
    "no-octal": "error",
    "no-prototype-builtins": "error",
    "no-redeclare": "error",
    "no-regex-spaces": "error",
    "no-self-assign": "error",
    "no-setter-return": "error",
    "no-shadow-restricted-names": "error",
    "no-sparse-arrays": "error",
    "no-this-before-super": "error",
    "no-undef": "error",
    "no-unreachable": "error",
    "no-unsafe-finally": "error",
    "no-unsafe-negation": "error",
    "no-unsafe-optional-chaining": "error",
    "no-unused-labels": "error",
    "no-unused-private-class-members": "error",
    "no-unused-vars": "error",
    "no-useless-backreference": "error",
    "no-useless-catch": "error",
    "no-with": "error",
    "require-yield": "error",
    "use-isnan": "error",
    "valid-typeof": "error",

    "no-restricted-imports": [
        "error",
        {
            paths: restrictedImportPaths,
            patterns: lodashEsPatterns,
        },
    ],
    "sort-imports": ["error", { ignoreCase: false, ignoreDeclarationSort: true, ignoreMemberSort: false }],

    // this rule is in direct conflict with the regexp plugin
    "no-useless-escape": "off",

    "no-unneeded-ternary": ["error", { defaultAssignment: false }],
    "no-extra-boolean-cast": "error",
    "no-unexpected-multiline": "off",
};

export const eslintRulesNativeSupported = {
    ...eslintRulesCommon,
    "no-duplicate-imports": "error",
};

// todo: https://github.com/oxc-project/oxc/issues/479
export const eslintRulesNativeNotSupported = {
    "no-duplicate-imports": ["error", { includeExports: true }],
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
    "no-restricted-syntax": [
        "error",
        {
            selector: "MemberExpression[object.name='React']",
            message: "Do not use `React.*`. Use named imports instead.",
        },
        {
            selector: "MemberExpression[object.name='ReactDOM']",
            message: "Do not use `ReactDOM.*`. Use named imports instead.",
        },
    ],
    "no-negated-condition": "error",
};

export const eslintRules = {
    ...eslintRulesNativeSupported,
    ...eslintRulesNativeNotSupported,
};

export const eslintOverrides = [
    {
        files: ["**/*.ts", "**/*.tsx"],
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
    {
        files: [
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
                    patterns: lodashEsPatterns,
                },
            ],
        },
    },
    {
        // ESLint flat config files require default export
        files: ["**/eslint.config.ts", "**/eslint.config.js"],
        rules: {
            "no-restricted-exports": "off",
        },
    },
];
