// (C) 2025-2026 GoodData Corporation

import type { IPackage, Rules } from "@gooddata/lint-config";

import type { IConfiguration, IConfigurationFlat } from "../types.js";

import { jsdocPlugin } from "./jsdoc.js";
import { tsParser } from "./typescript.js";

const tsdocPlugin: IPackage = {
    name: "eslint-plugin-tsdoc",
    version: "0.5.4",
};

type RulePrefix = "tsdoc" | "jsdoc";

const rules: Rules<RulePrefix> = {
    "tsdoc/syntax": "error",

    // Completeness: if there's a docblock, all params must be documented
    "jsdoc/require-param": [
        "error",
        {
            contexts: [
                {
                    context: "FunctionDeclaration",
                    comment: 'JsdocBlock > JsdocTag[tag="param"]',
                },
                {
                    context: "FunctionExpression",
                    comment: 'JsdocBlock > JsdocTag[tag="param"]',
                },
                {
                    context: "ArrowFunctionExpression",
                    comment: 'JsdocBlock > JsdocTag[tag="param"]',
                },
                {
                    context: "MethodDefinition",
                    comment: 'JsdocBlock > JsdocTag[tag="param"]',
                },
            ],
        },
    ],

    // TSDoc style usually doesn't put JSDoc `{type}` after @param
    "jsdoc/require-param-type": "off",
};

const flat: IConfigurationFlat<RulePrefix> = {
    packages: [tsdocPlugin, jsdocPlugin],
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx"],
            parser: tsParser,
            plugins: {
                tsdoc: tsdocPlugin,
                jsdoc: jsdocPlugin,
            },
            settings: {
                jsdoc: {
                    mode: "typescript",
                },
            },
            rules,
        },
    ],
};

export const tsdoc: IConfiguration<RulePrefix> = {
    legacy: {
        packages: [tsdocPlugin, jsdocPlugin],
        overrides: [
            {
                files: ["**/*.ts", "**/*.tsx"],
                parser: tsParser,
                plugins: ["tsdoc", "jsdoc"],
                settings: {
                    jsdoc: {
                        mode: "typescript",
                    },
                },
                rules,
            },
        ],
    },
    flat: { v9: flat, v9ox: flat, v10: flat, v10ox: flat },
};
