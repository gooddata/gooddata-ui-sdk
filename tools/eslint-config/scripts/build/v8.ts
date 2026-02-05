// (C) 2026 GoodData Corporation

import { writeFileSync } from "fs";

import type { IConfigurationV8, IDualConfiguration, Rules } from "../../src/types.js";

// Types for the output eslintrc JSON format
interface IEslintConfigurationCommon {
    parser?: string;
    plugins?: string[];
    parserOptions?: Record<string, unknown>;
    rules?: Rules;
    settings?: Record<string, object>;
    env?: Record<string, boolean>;
    ignorePatterns?: string[];
}

interface IOverride extends IEslintConfigurationCommon {
    files: string[];
    excludedFiles?: string[];
}

interface IEslintConfiguration extends IEslintConfigurationCommon {
    overrides?: IOverride[];
}

function createEmptyConfig(): IEslintConfiguration {
    return {
        plugins: [],
        rules: {},
        overrides: [],
        settings: {},
        env: {},
        ignorePatterns: [],
    };
}

function applyConfiguration(
    eslintConfiguration: IEslintConfiguration,
    configuration: IConfigurationV8,
): IEslintConfiguration {
    const newConfiguration: IEslintConfiguration = structuredClone(eslintConfiguration);

    if (configuration.parser) {
        newConfiguration.parser = configuration.parser;
    }

    if (configuration.plugins) {
        for (const plugin of configuration.plugins) {
            if (!newConfiguration.plugins?.includes(plugin)) {
                newConfiguration.plugins?.push(plugin);
            }
        }
    }

    if (configuration.parserOptions) {
        newConfiguration.parserOptions = {
            ...newConfiguration.parserOptions,
            ...configuration.parserOptions,
        };
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

export function buildV8(
    commonConfigurations: IDualConfiguration[],
    variants: Record<string, IDualConfiguration[]>,
): void {
    // Build base config from commonConfigurations
    let baseConfig = createEmptyConfig();

    for (const dualConfig of commonConfigurations) {
        baseConfig = applyConfiguration(baseConfig, dualConfig.v8);
    }

    writeFileSync("dist/base.json", JSON.stringify(baseConfig, null, 4));

    // Build variant configs
    for (const [variantName, variantConfigs] of Object.entries(variants)) {
        let variantConfig = structuredClone(baseConfig);

        for (const dualConfig of variantConfigs) {
            variantConfig = applyConfiguration(variantConfig, dualConfig.v8);
        }

        writeFileSync(`dist/${variantName}.json`, JSON.stringify(variantConfig, null, 4));
    }
}
