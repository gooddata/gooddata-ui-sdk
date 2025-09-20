// (C) 2007-2025 GoodData Corporation
import * as fs from "fs";
import * as path from "path";

import { OptionValues } from "commander";
import { identity, pick, pickBy } from "lodash-es";

import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME } from "./constants.js";
import { DataRecorderConfig } from "./types.js";

function mergeConfigs(config: DataRecorderConfig, prevConfig = DEFAULT_CONFIG): DataRecorderConfig {
    return {
        ...prevConfig,
        ...pickBy(
            pick(config, ["hostname", "projectId", "tigerToken", "recordingDir", "replaceProjectId"]),
            identity,
        ),
    };
}

function retrieveConfigFromObject(obj: OptionValues): DataRecorderConfig {
    return {
        hostname: obj.hostname ?? null,
        projectId: obj.projectId ?? null,
        tigerToken: obj.tigerToken ?? null,
        recordingDir: obj.recordingDir ?? null,
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
