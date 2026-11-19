// (C) 2025-2026 GoodData Corporation

import { tsdocOverrideFiles, tsdocPlugin, tsdocRules } from "@gooddata/lint-config";

import type { IConfiguration, IConfigurationFlat } from "../types.js";

import { jsdocPlugin } from "./jsdoc.js";
import { typescriptEslintParser } from "./typescript.js";

type RulePrefix = "tsdoc" | "jsdoc";

const flat: IConfigurationFlat<RulePrefix> = {
    packages: [typescriptEslintParser, tsdocPlugin, jsdocPlugin],
    overrides: [
        {
            files: tsdocOverrideFiles,
            parser: typescriptEslintParser.name,
            plugins: {
                tsdoc: tsdocPlugin,
                jsdoc: jsdocPlugin,
            },
            settings: {
                jsdoc: {
                    mode: "typescript",
                },
            },
            rules: tsdocRules,
        },
    ],
};

export const tsdoc: IConfiguration<RulePrefix> = {
    legacy: {
        packages: [typescriptEslintParser, tsdocPlugin, jsdocPlugin],
        overrides: [
            {
                files: tsdocOverrideFiles,
                parser: typescriptEslintParser.name,
                plugins: ["tsdoc", "jsdoc"],
                settings: {
                    jsdoc: {
                        mode: "typescript",
                    },
                },
                rules: tsdocRules,
            },
        ],
    },
    flat: { v9: flat, v9ox: {}, v10: flat, v10ox: {} },
};
