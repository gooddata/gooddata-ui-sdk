// (C) 2007-2021 GoodData Corporation
import identity from "lodash/identity.js";
import pick from "lodash/pick.js";
import pickBy from "lodash/pickBy.js";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME } from "./constants.js";
import { DataRecorderConfig } from "./types.js";
import { OptionValues } from "commander";

function mergeConfigs(config: DataRecorderConfig, prevConfig = DEFAULT_CONFIG): DataRecorderConfig {
    return {
        ...prevConfig,
        ...pickBy(
            pick(config, [
                "hostname",
                "projectId",
                "username",
                "password",
                "recordingDir",
                "backend",
                "replaceProjectId",
            ]),
            identity,
        ),
    };
}

function retrieveConfigFromObject(obj: OptionValues): DataRecorderConfig {
    return {
        hostname: obj.hostname ?? null,
        projectId: obj.projectId ?? null,
        username: obj.username ?? null,
        password: obj.password ?? null,
        recordingDir: obj.recordingDir ?? null,
        backend: obj.backend ?? null,
        replaceProjectId: obj.replaceProjectId ?? null,
    };
}

export function getConfigFromOptions(obj: OptionValues, prevConfig = DEFAULT_CONFIG): DataRecorderConfig {
    return mergeConfigs(retrieveConfigFromObject(obj), prevConfig);
}

export function getConfigFromConfigFile(
    filePath = DEFAULT_CONFIG_FILE_NAME,
    prevConfig = DEFAULT_CONFIG,
): DataRecorderConfig {
    const absolutePath = path.resolve(filePath);

    if (fs.existsSync(absolutePath)) {
        const configData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return mergeConfigs(configData, prevConfig);
    }

    return prevConfig;
}
