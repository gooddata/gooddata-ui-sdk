// (C) 2021-2022 GoodData Corporation
import path from "path";

import { ToolkitOptions, ToolkitConfigFile, DefaultConfigName } from "./data.js";
import { readFile } from "./utils/index.js";
import { skipped, message, fail } from "./utils/console.js";

export async function configure(cwd: string, opts: ToolkitOptions): Promise<ToolkitConfigFile> {
    const [configPath, configFile] = await loadConfigFile(cwd, opts.config);

    if (configFile === null) {
        skipped("Configuration file not provided or not found.", opts.debug);
        return { ...opts };
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
    const configPath = path.resolve(cwd, providedPath || `./${DefaultConfigName}`);

    try {
        await readFile(configPath);
        return [configPath, await import(configPath)];
    } catch (e) {
        return [configPath, null];
    }
}
