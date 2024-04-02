// (C) 2007-2024 GoodData Corporation
import { DataRecorderConfig, BackendType } from "./types.js";

export const DEFAULT_HOSTNAME = "https://staging-automation.dev-latest.stg11.panther.intgdc.com/";
export const DEFAULT_CONFIG_FILE_NAME = ".gdmockrc";
export const DEFAULT_BACKEND: BackendType = "tiger";

export const DEFAULT_CONFIG: DataRecorderConfig = {
    hostname: null,
    projectId: null,
    tigerToken: null,
    recordingDir: null,
    backend: null,
    replaceProjectId: null,
};
