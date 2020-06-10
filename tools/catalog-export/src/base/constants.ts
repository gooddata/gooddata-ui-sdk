// (C) 2007-2020 GoodData Corporation
import { CatalogExportConfig } from "./types";

export const DEFAULT_HOSTNAME = "https://secure.gooddata.com";
export const DEFAULT_CONFIG_FILE_NAME = ".gdcatalogrc";
export const DEFAULT_OUTPUT_FILE_NAME = "catalog.json";

export const DEFAULT_CONFIG: CatalogExportConfig = {
    hostname: null,
    projectId: null,
    projectName: null,
    username: null,
    password: null,
    output: null,
    tiger: false,
};
