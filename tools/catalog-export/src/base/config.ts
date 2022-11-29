// (C) 2007-2022 GoodData Corporation
import identity from "lodash/identity";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME } from "./constants";
import { CatalogExportConfig } from "./types";
import { OptionValues } from "commander";

function mergeConfigs(config: CatalogExportConfig, prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
    return {
        ...prevConfig,
        ...pickBy(
            pick(config, [
                "hostname",
                "projectId",
                "projectName",
                "workspaceId",
                "workspaceName",
                "username",
                "password",
                "output",
                "backend",
                "demo",
            ]),
            identity,
        ),
    };
}

function retrieveConfigFromObject(obj: OptionValues): CatalogExportConfig {
    return {
        hostname: obj.hostname ?? null,
        projectId: obj.projectId ?? null,
        projectName: obj.projectName ?? null,
        workspaceId: obj.workspaceId ?? null,
        workspaceName: obj.workspaceName ?? null,
        username: obj.username ?? null,
        password: obj.password ?? null,
        output: obj.output ?? null,
        backend: obj.backend ?? "bear",
        demo: obj.demo ?? false,
    };
}

export function getConfigFromEnv(prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
    return mergeConfigs(
        retrieveConfigFromObject({
            username: process.env.GDC_USERNAME,
            password: process.env.GDC_PASSWORD,
        }),
        prevConfig,
    );
}

export function getConfigFromOptions(obj: OptionValues, prevConfig = DEFAULT_CONFIG): CatalogExportConfig {
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
