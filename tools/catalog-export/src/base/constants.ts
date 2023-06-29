// (C) 2007-2023 GoodData Corporation
import { CatalogExportConfig } from "./types.js";

export const DEFAULT_HOSTNAME = "https://secure.gooddata.com";
export const DEFAULT_CONFIG_FILE_NAME = ".gdcatalogrc";
export const DEFAULT_OUTPUT_FILE_NAME = "catalog.ts";

export const API_TOKEN_VAR_NAME = "TIGER_API_TOKEN";

export const DEFAULT_CONFIG: CatalogExportConfig = {
    hostname: null,
    workspaceId: null,
    username: null,
    password: null,
    token: null,
    catalogOutput: null,
    backend: "tiger",
};
