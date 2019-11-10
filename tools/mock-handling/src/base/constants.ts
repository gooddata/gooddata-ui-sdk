// (C) 2007-2019 GoodData Corporation
import { DataRecorderConfig } from "./types";

export const DEFAULT_HOSTNAME = "https://secure.gooddata.com";
export const DEFAULT_CONFIG_FILE_NAME = ".gdmockrc";

export const DEFAULT_CONFIG: DataRecorderConfig = {
    hostname: null,
    projectId: null,
    username: null,
    password: null,
    recordingDir: null,
};
