// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration = {
    extends: ["eslint:recommended"],
    rules: {
        "no-console": [2, { allow: ["warn", "error"] }],
        "no-duplicate-imports": "error",
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
                patterns: [
                    {
                        group: ["lodash-es"],
                        importNames: ["get", "getOr"],
                        message: "Please use the ?. and ?? operators instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["keys"],
                        message: "Please use Object.keys() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["values"],
                        message: "Please use Object.values() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["entries", "toPairs"],
                        message: "Please use Object.entries() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["map"],
                        message: "Please use Array.prototype.map() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["flatMap"],
                        message: "Please use Array.prototype.flatMap() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["filter"],
                        message: "Please use Array.prototype.filter() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["find"],
                        message: "Please use Array.prototype.find() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["findIndex"],
                        message: "Please use Array.prototype.findIndex() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["includes"],
                        message: "Please use Array.prototype.includes() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["some"],
                        message: "Please use Array.prototype.some() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["every"],
                        message: "Please use Array.prototype.every() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["concat"],
                        message: "Please use Array.prototype.concat() or spread [...arr1, ...arr2] instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["reverse"],
                        message: "Please use Array.prototype.reverse() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["slice"],
                        message: "Please use Array.prototype.slice() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["indexOf"],
                        message: "Please use Array.prototype.indexOf() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["lastIndexOf"],
                        message: "Please use Array.prototype.lastIndexOf() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["fill"],
                        message: "Please use Array.prototype.fill() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["startsWith"],
                        message: "Please use String.prototype.startsWith() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["endsWith"],
                        message: "Please use String.prototype.endsWith() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["repeat"],
                        message: "Please use String.prototype.repeat() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["padStart"],
                        message: "Please use String.prototype.padStart() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["padEnd"],
                        message: "Please use String.prototype.padEnd() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["trim"],
                        message: "Please use String.prototype.trim() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["trimStart", "trimLeft"],
                        message: "Please use String.prototype.trimStart() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["trimEnd", "trimRight"],
                        message: "Please use String.prototype.trimEnd() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["toUpper"],
                        message: "Please use String.prototype.toUpperCase() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["toLower"],
                        message: "Please use String.prototype.toLowerCase() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isArray"],
                        message: "Please use Array.isArray() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isNaN"],
                        message: "Please use Number.isNaN() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isFinite"],
                        message: "Please use Number.isFinite() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isInteger"],
                        message: "Please use Number.isInteger() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isNull"],
                        message: "Please use value === null instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isUndefined"],
                        message: "Please use value === undefined instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["defaultTo"],
                        message: "Please use value ?? defaultValue instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["assign"],
                        message: "Please use Object.assign() or spread syntax {...obj} instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["flatten"],
                        message: "Please use Array.prototype.flat() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["flattenDeep"],
                        message: "Please use Array.prototype.flat(Infinity) instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isNil"],
                        message: "Please use value === null || value === undefined instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["noop"],
                        message: "Please use () => {} instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["identity"],
                        message: "Please use x => x instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["first", "head"],
                        message: "Please use Array.prototype.at(0) instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["last"],
                        message: "Please use Array.prototype.at(-1) instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["forEach"],
                        message: "Please use Array.prototype.forEach() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["fromPairs"],
                        message: "Please use Object.fromEntries() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["join"],
                        message: "Please use Array.prototype.join() instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isDate"],
                        message: "Please use val instanceof Date instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isFunction"],
                        message: "Please use typeof val === 'function' instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isNumber"],
                        message: "Please use typeof val === 'number' instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isObject"],
                        message: "Please use val !== null && typeof val === 'object' instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["isString"],
                        message: "Please use typeof val === 'string' instead.",
                    },
                    // { todo: enable when target changed to es2023 or later
                    //     group: ["lodash-es"],
                    //     importNames: ["findLastIndex"],
                    //     message: "Please use Array.prototype.findLastIndex() instead.",
                    // },
                    {
                        group: ["lodash-es"],
                        importNames: ["toString"],
                        message: "Please use String(val) instead.",
                    },
                    {
                        group: ["lodash-es"],
                        importNames: ["flow", "flowRight"],
                        message: "Please refactor your code instead.",
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
    },
};

export default configuration;
