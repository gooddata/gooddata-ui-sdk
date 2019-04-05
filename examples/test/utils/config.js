// (C) 2007-2019 GoodData Corporation
import { existsSync, readFileSync } from "fs";
import * as path from "path";
import program from "commander";
import invariant from "invariant";

const DEFAULT_CONFIG_FILE_NAME = ".testcaferc.json";
const DEFAULT_URL = "https://localhost:8999";

export const definedOptions = [
    {
        key: "config",
        param: "--config <path>",
        description: `Custom config file (default ${DEFAULT_CONFIG_FILE_NAME})`,
        defaultValue: DEFAULT_CONFIG_FILE_NAME,
    },
    {
        key: "url",
        param: "--url <url>",
        description: `Url of tested app. The default is ${DEFAULT_URL}`,
        defaultValue: DEFAULT_URL,
        isRequired: true,
    },
    {
        key: "username",
        param: "--username <email>",
        description: "Your username that you use to log in to GoodData platform.",
        isRequired: true,
    },
    {
        key: "password",
        param: "--password <value>",
        description: "Your password that you use to log in to GoodData platform.",
        isRequired: true,
    },
];
export const definedOptionKeys = definedOptions.map(definedOption => definedOption.key);
export const requiredOptionKeys = definedOptions
    .filter(requiredOptions => requiredOptions.isRequired)
    .map(requiredOptions => requiredOptions.key);

definedOptions.map(({ param, description }) => program.option(param, description));

program.parse(process.argv);

// get config defaults
const configDefaults = definedOptions
    .filter(definedOption => definedOption.defaultValue)
    .reduce(
        (defaults, defaultOption) => ({
            ...defaults,
            [defaultOption.key]: defaultOption.defaultValue,
        }),
        {},
    );

// get options from local confif if it exists
const configPath = path.join(process.cwd(), program.config || DEFAULT_CONFIG_FILE_NAME);
let localConfig = {};
const configExists = existsSync(configPath);

if (configExists) {
    try {
        localConfig = JSON.parse(readFileSync(configPath));
    } catch (error) {
        console.log("JSON parse error", error); // eslint-disable-line no-console
    }
} else {
    console.log(`No config file found at ${configPath}`); // eslint-disable-line no-console
}

// get options from params
const paramOptions = definedOptionKeys.reduce(
    (setOptions, key) =>
        program[key] !== undefined
            ? {
                  ...setOptions,
                  [key]: program[key],
              }
            : setOptions,
    {},
);

// asseble final config
export const config = {
    ...configDefaults,
    ...localConfig,
    ...paramOptions,
};

requiredOptionKeys.map(requiredKey => {
    const { key, param, defaultValue } = definedOptions.find(
        definedOption => definedOption.key === requiredKey,
    );
    const defaultText = defaultValue ? ` Default: ${defaultValue}` : "";
    return invariant(
        config[requiredKey] !== undefined,
        `${key} is missing in config. Pass it with ${param} or { "${key}": "${key}" } in ${DEFAULT_CONFIG_FILE_NAME}${defaultText}`,
    );
});

export default config;
