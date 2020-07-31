// (C) 2007-2020 GoodData Corporation
import { get, pick, pickBy, identity } from "lodash";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME } from "./constants";
import { CatalogExportConfig } from "./types";

function mergeConfigs(config: CatalogExportConfig, prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
    return {
        ...prevConfig,
        ...pickBy(
            pick(config, [
                "hostname",
                "projectId",
                "projectName",
                "username",
                "password",
                "output",
                "backend",
            ]),
            identity,
        ),
    };
}

function retrieveConfigFromObject(obj: object): CatalogExportConfig {
    return {
        hostname: get(obj, "hostname", null),
        projectId: get(obj, "projectId", null),
        projectName: get(obj, "projectName", null),
        username: get(obj, "username", null),
        password: get(obj, "password", null),
        output: get(obj, "output", null),
        backend: get(obj, "backend", "bear"),
    };
}

export function getConfigFromProgram(obj: object, prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
    return mergeConfigs(retrieveConfigFromObject(obj), prevConfig);
}

export function getConfigFromConfigFile(
    filePath = DEFAULT_CONFIG_FILE_NAME,
    prevConfig = DEFAULT_CONFIG,
): CatalogExportConfig {
    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) {
        const configData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return mergeConfigs(configData, prevConfig);
    }

    return prevConfig;
}
