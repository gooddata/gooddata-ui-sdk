// (C) 2007-2019 GoodData Corporation
import { existsSync, readFileSync } from "fs";
import * as path from "path";
import { program } from "commander";
import invariant from "ts-invariant";

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
    },
    {
        key: "password",
        param: "--password <value>",
        description: "Your password that you use to log in to GoodData platform.",
    },
];
export const definedOptionKeys = definedOptions.map((definedOption) => definedOption.key);
export const requiredOptionKeys = definedOptions
    .filter((requiredOptions) => requiredOptions.isRequired)
    .map((requiredOptions) => requiredOptions.key);

definedOptions.forEach(({ param, description }) => program.option(param, description));

program.parse(process.argv);

// get config defaults
const configDefaults = definedOptions
    .filter((definedOption) => definedOption.defaultValue)
    .reduce(
        (defaults, defaultOption) => ({
            ...defaults,
            [defaultOption.key]: defaultOption.defaultValue,
        }),
        {} as IConfig,
    );

const options = program.opts();
// get options from local config if it exists
const configPath = path.join(process.cwd(), options.config || DEFAULT_CONFIG_FILE_NAME);
let localConfig: IConfig = {};
const configExists = existsSync(configPath);

if (configExists) {
    try {
        localConfig = JSON.parse(readFileSync(configPath).toString());
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log("JSON parse error", error);
    }
} else {
    // eslint-disable-next-line no-console
    console.log(`No config file found at ${configPath}`);
}

// get options from params
const paramOptions = definedOptionKeys.reduce(
    (setOptions, key) =>
        options[key] !== undefined
            ? {
                  ...setOptions,
                  [key]: options[key],
              }
            : setOptions,
    {} as IConfig,
);

interface IConfig {
    username?: string;
    password?: string;
    url?: string;
}

// assemble final config
export const config: IConfig = {
    ...configDefaults,
    ...localConfig,
    ...paramOptions,
};

requiredOptionKeys.map((requiredKey) => {
    const { key, param, defaultValue } = definedOptions.find(
        (definedOption) => definedOption.key === requiredKey,
    );
    const defaultText = defaultValue ? ` Default: ${defaultValue}` : "";
    return invariant(
        config[requiredKey] !== undefined,
        `${key} is missing in config. Pass it with ${param} or { "${key}": "${key}" } in ${DEFAULT_CONFIG_FILE_NAME}${defaultText}`,
    );
});

export default config;
