// (C) 2025-2026 GoodData Corporation

import { readFileSync, writeFileSync } from "fs";

import { common, variants } from "../src/index.js";
import type { IConfiguration, Rules } from "../src/types.js";

interface IEslintConfigurationCommon {
    parser?: string;
    plugins?: string[];
    extends?: string[];
    parserOptions?: Record<string, string | number>;
    rules?: Rules;
    settings?: Record<string, object>;
    env?: Record<string, boolean>;
    ignorePatterns?: string[];
}

interface IOverride extends IEslintConfigurationCommon {
    files: string[];
}

interface IEslintConfiguration extends IEslintConfigurationCommon {
    overrides?: IOverride[];
}

let commonConfig: IEslintConfiguration = {
    plugins: [],
    extends: [],
    rules: {},
    overrides: [],
    settings: {},
    env: {},
    ignorePatterns: [],
};

function applyConfiguration(eslintConfiguration: IEslintConfiguration, configuration: IConfiguration) {
    const newConfiguration: IEslintConfiguration = structuredClone(eslintConfiguration);

    if (configuration.parser) newConfiguration.parser = configuration.parser;
    if (configuration.plugins) {
        for (const plugin of configuration.plugins) {
            if (!newConfiguration.plugins?.includes(plugin)) {
                newConfiguration.plugins?.push(plugin);
            }
        }
    }
    if (configuration.extends)
        newConfiguration.extends = [...newConfiguration.extends, ...configuration.extends];
    if (configuration.parserOptions) newConfiguration.parserOptions = configuration.parserOptions;
    if (configuration.rules) newConfiguration.rules = { ...newConfiguration.rules, ...configuration.rules };
    if (configuration.override) newConfiguration.overrides?.push(configuration.override);
    if (configuration.settings)
        newConfiguration.settings = { ...newConfiguration.settings, ...configuration.settings };
    if (configuration.env) newConfiguration.env = { ...newConfiguration.env, ...configuration.env };
    if (configuration.ignorePatterns)
        newConfiguration.ignorePatterns = [
            ...newConfiguration.ignorePatterns,
            ...configuration.ignorePatterns,
        ];

    return newConfiguration;
}

for (const configuration of common) {
    commonConfig = applyConfiguration(commonConfig, configuration);
}

writeFileSync("dist/base.json", JSON.stringify(commonConfig, null, 4));

for (const variantName in variants) {
    const variant = variants[variantName as keyof typeof variants];

    let variantConfig = structuredClone(commonConfig);

    for (const configuration of variant) {
        variantConfig = applyConfiguration(variantConfig, configuration);
    }

    writeFileSync(`dist/${variantName}.json`, JSON.stringify(variantConfig, null, 4));
}

writeFileSync(`dist/tsOverride.cjs`, readFileSync(`src/utils/tsOverride.cjs`));
