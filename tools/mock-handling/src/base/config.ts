// (C) 2007-2020 GoodData Corporation
import { get, pick, pickBy, identity } from "lodash";
import * as fs from "fs";
import * as path from "path";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME } from "./constants";
import { DataRecorderConfig } from "./types";

function mergeConfigs(config: DataRecorderConfig, prevConfig = DEFAULT_CONFIG): DataRecorderConfig {
    return {
        ...prevConfig,
        ...pickBy(
            pick(config, ["hostname", "projectId", "username", "password", "recordingDir", "backend"]),
            identity,
        ),
    };
}

function retrieveConfigFromObject(obj: object): DataRecorderConfig {
    return {
        hostname: get(obj, "hostname", null),
        projectId: get(obj, "projectId", null),
        username: get(obj, "username", null),
        password: get(obj, "password", null),
        recordingDir: get(obj, "recordingDir", null),
        backend: get(obj, "backend", null),
    };
}

export function getConfigFromProgram(obj: object, prevConfig = DEFAULT_CONFIG): DataRecorderConfig {
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
