// (C) 2025-2026 GoodData Corporation

// Build OxLint JSON configs

import { writeFileSync } from "fs";

import { common, variants } from "../src/index.js";
import { type Category, type IConfiguration, type IJsPlugin, type Level, type Rules } from "../src/types.js";

// Types for the output eslintrc JSON format
interface IOxLintConfigurationCommon {
    categories?: Partial<Record<Category, Level>>;
    plugins?: string[];
    jsPlugins?: IJsPlugin[];
    rules?: Rules;
    settings?: Record<string, object>;
    env?: Record<string, boolean>;
    ignorePatterns?: string[];
}

interface IOverride extends IOxLintConfigurationCommon {
    files: string[];
    excludedFiles?: string[];
}

interface IOxLintConfiguration extends IOxLintConfigurationCommon {
    overrides?: IOverride[];
}

function createEmptyConfig(): IOxLintConfiguration {
    return {
        categories: {},
        plugins: [],
        jsPlugins: [],
        rules: {},
        overrides: [],
        settings: {},
        env: {},
        ignorePatterns: [],
    };
}

function applyConfiguration(
    eslintConfiguration: IOxLintConfiguration,
    configuration: IConfiguration,
): IOxLintConfiguration {
    const newConfiguration: IOxLintConfiguration = structuredClone(eslintConfiguration);

    if (configuration.categories) {
        newConfiguration.categories = { ...newConfiguration.categories, ...configuration.categories };
    }

    if (configuration.plugins) {
        for (const plugin of configuration.plugins) {
            if (!newConfiguration.plugins?.includes(plugin)) {
                newConfiguration.plugins?.push(plugin);
            }
        }
    }

    if (configuration.jsPlugins) {
        for (const plugin of configuration.jsPlugins) {
            if (!newConfiguration.jsPlugins?.includes(plugin)) {
                newConfiguration.jsPlugins?.push(plugin);
            }
        }
    }

    if (configuration.rules) {
        newConfiguration.rules = { ...newConfiguration.rules, ...configuration.rules };
    }

    if (configuration.overrides) {
        newConfiguration.overrides?.push(...configuration.overrides);
    }

    if (configuration.settings) {
        newConfiguration.settings = { ...newConfiguration.settings, ...configuration.settings };
    }

    if (configuration.env) {
        newConfiguration.env = { ...newConfiguration.env, ...configuration.env };
    }

    if (configuration.ignorePatterns) {
        newConfiguration.ignorePatterns = [
            ...(newConfiguration.ignorePatterns ?? []),
            ...configuration.ignorePatterns,
        ];
    }

    return newConfiguration;
}

// Build base config from commonConfigurations
let baseConfig = createEmptyConfig();

for (const config of common) {
    baseConfig = applyConfiguration(baseConfig, config);
}

writeFileSync("dist/base.json", JSON.stringify(baseConfig, null, 4));

// Build variant configs
for (const [variantName, variantConfigs] of Object.entries(variants)) {
    let variantConfig = structuredClone(baseConfig);

    for (const config of variantConfigs) {
        variantConfig = applyConfiguration(variantConfig, config);
    }

    writeFileSync(`dist/${variantName}.json`, JSON.stringify(variantConfig, null, 4));
}
