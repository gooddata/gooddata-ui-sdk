// (C) 2007-2020 GoodData Corporation
import { DataRecorderConfig, BackendType } from "./types.js";

export const DEFAULT_HOSTNAME = "https://secure.gooddata.com";
export const DEFAULT_CONFIG_FILE_NAME = ".gdmockrc";
export const DEFAULT_BACKEND: BackendType = "bear";

export const DEFAULT_CONFIG: DataRecorderConfig = {
    hostname: null,
    projectId: null,
    username: null,
    password: null,
    recordingDir: null,
    backend: null,
    replaceProjectId: null,
};
