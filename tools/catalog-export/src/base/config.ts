// (C) 2007-2025 GoodData Corporation
import * as fs from "fs/promises";
import * as path from "path";

import { OptionValues } from "commander";
import { identity, pick, pickBy } from "lodash-es";

import { API_TOKEN_VAR_NAME } from "./constants.js";
import { CatalogExportConfig } from "./types.js";

export function mergeConfigs(...configs: Partial<CatalogExportConfig>[]): CatalogExportConfig {
    return Object.assign(
        {},
        ...configs.map((config) =>
            pickBy(pick(config, ["hostname", "workspaceId", "token", "catalogOutput"]), identity),
        ),
    );
}

/**
 * Read credentials from ENV variables
 */
export function getConfigFromEnv(env: { [key: string]: string | undefined }): Partial<CatalogExportConfig> {
    return {
        token: env[API_TOKEN_VAR_NAME] ?? null,
    };
}

/**
 * Allow normal props and credentials to be defined as CLI options
 */
export function getConfigFromOptions(obj: OptionValues): Partial<CatalogExportConfig> {
    return pick(obj, ["hostname", "workspaceId", "token", "catalogOutput"]);
}

/**
 * Config file can only hold normal props, not credentials
 */
export async function getConfigFromConfigFile(filePath: string): Promise<Partial<CatalogExportConfig>> {
    return pick((await readJsonFile<Partial<CatalogExportConfig>>(path.resolve(filePath))) ?? {}, [
        "hostname",
        "workspaceId",
        "catalogOutput",
    ]);
}

/**
 * package.json can only hold normal props, not credentials
 */
export async function getConfigFromPackage(workingDir: string): Promise<Partial<CatalogExportConfig>> {
    let dir = path.resolve(workingDir);
    const { root } = path.parse(workingDir);
    const packages = [];

    while (dir !== root) {
        packages.push(await readJsonFile<any>(path.join(dir, "package.json")));
        dir = path.dirname(dir);
    }

    return mergeConfigs(
        ...packages
            .filter(identity)
            .map((pack) => pick(pack.gooddata ?? {}, ["hostname", "workspaceId", "catalogOutput"]))
            .reverse(),
    );
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
    let text;

    try {
        text = await fs.readFile(filePath, "utf8");
    } catch {
        // Don't care if can't read file
        // Does not exist or no rights (expected when reading closer to the root)
        return null;
    }

    // Let JSON throw if it's not a valid JSON
    return JSON.parse(text);
}
