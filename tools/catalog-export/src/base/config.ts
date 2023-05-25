// (C) 2007-2023 GoodData Corporation
import * as path from "path";
import * as fs from "fs/promises";
import identity from "lodash/identity.js";
import pick from "lodash/pick.js";
import pickBy from "lodash/pickBy.js";
import { OptionValues } from "commander";
import { CatalogExportConfig } from "./types.js";
import { API_TOKEN_VAR_NAME } from "./constants.js";

export function mergeConfigs(...configs: Partial<CatalogExportConfig>[]): CatalogExportConfig {
    return Object.assign(
        {},
        ...configs.map((config) =>
            pickBy(
                pick(config, [
                    "hostname",
                    "workspaceId",
                    "username",
                    "password",
                    "token",
                    "catalogOutput",
                    "backend",
                ]),
                identity,
            ),
        ),
    );
}

/**
 * Read credentials from ENV variables
 */
export function getConfigFromEnv(env: { [key: string]: string | undefined }): Partial<CatalogExportConfig> {
    return {
        username: env.GDC_USERNAME ?? null,
        password: env.GDC_PASSWORD ?? null,
        token: env[API_TOKEN_VAR_NAME] ?? null,
    };
}

/**
 * Allow normal props and credentials to be defined as CLI options
 */
export function getConfigFromOptions(obj: OptionValues): Partial<CatalogExportConfig> {
    return pick(obj, [
        "hostname",
        "workspaceId",
        "username",
        "password",
        "token",
        "catalogOutput",
        "backend",
    ]);
}

/**
 * Config file can only hold normal props, not credentials
 */
export async function getConfigFromConfigFile(filePath: string): Promise<Partial<CatalogExportConfig>> {
    return pick((await readJsonFile<Partial<CatalogExportConfig>>(path.resolve(filePath))) ?? {}, [
        "hostname",
        "workspaceId",
        "catalogOutput",
        "backend",
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
            .map((pack) => pick(pack.gooddata ?? {}, ["hostname", "workspaceId", "catalogOutput", "backend"]))
            .reverse(),
    );
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
    let text;

    try {
        text = await fs.readFile(filePath, "utf8");
    } catch (e) {
        // Don't care if can't read file
        // Does not exist or no rights (expected when reading closer to the root)
        return null;
    }

    // Let JSON throw if it's not a valid JSON
    return JSON.parse(text);
}
