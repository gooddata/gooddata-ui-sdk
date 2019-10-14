// (C) 2007-2019 GoodData Corporation
import { get, pick } from "lodash";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME } from "./constants";
import { CatalogExportConfig } from "./types";

export function getConfig(config: CatalogExportConfig, prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
    return {
        ...prevConfig,
        ...pick(config, ["hostname", "projectId", "projectName", "username", "password", "output"]),
    };
}

function retrieveConfigFromObject(obj: any): CatalogExportConfig {
    return {
        hostname: get<string | null>(obj, "hostname", null),
        projectId: get<string | null>(obj, "projectId", null),
        projectName: get<string | null>(obj, "projectName", null),
        username: get<string | null>(obj, "username", null),
        password: get<string | null>(obj, "password", null),
        output: get<string | null>(obj, "output", null),
    };
}

export function getConfigFromProgram(obj: any, prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
    return getConfig(retrieveConfigFromObject(obj), prevConfig);
}

export function getConfigFromConfigFile(
    filePath = DEFAULT_CONFIG_FILE_NAME,
    prevConfig = DEFAULT_CONFIG,
): CatalogExportConfig {
    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) {
        const configData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return getConfig(configData, prevConfig);
    }

    return prevConfig;
}
