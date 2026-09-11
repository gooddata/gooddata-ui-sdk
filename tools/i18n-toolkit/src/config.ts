// (C) 2021-2026 GoodData Corporation

import { existsSync } from "fs";
import path from "path";

import { DefaultConfigFileNames, type ToolkitConfigFile, type ToolkitOptions } from "./data.js";
import { fail, message } from "./utils/console.js";
import { readFile } from "./utils/index.js";

export async function configure(cwd: string, opts: ToolkitOptions): Promise<ToolkitConfigFile> {
    const [configPath, configFile] = await loadConfigFile(cwd, opts.config);

    if (configFile === null) {
        throw new Error("Configuration file not provided or not found.");
    }

    message(` ╏ Using configuration file "${configPath}".`);

    try {
        return { ...configFile, ...opts };
    } catch (e: any) {
        const err = e as Error;
        fail(err.message);
        throw new Error(`There is provided config file, but can not load data from it.`);
    }
}

async function loadConfigFile(
    cwd: string,
    providedPath?: string,
): Promise<[string, ToolkitConfigFile | null]> {
    if (providedPath) {
        return importConfigFile(path.resolve(cwd, providedPath));
    }

    for (const configName of DefaultConfigFileNames) {
        const configPath = path.resolve(cwd, `./${configName}`);

        if (existsSync(configPath)) {
            return importConfigFile(configPath);
        }
    }

    return ["", null];
}

async function importConfigFile(configPath: string): Promise<[string, ToolkitConfigFile]> {
    try {
        await readFile(configPath);
        const impConfig = await import(configPath);
        if (impConfig.default) {
            return [configPath, impConfig.default];
        }
        return [configPath, impConfig];
    } catch (e) {
        throw new Error(e);
    }
}
