// (C) 2007-2024 GoodData Corporation
import { type CatalogExportConfig } from "./types.js";

export const DEFAULT_CONFIG_FILE_NAME = ".gdcatalogrc";
export const DEFAULT_OUTPUT_FILE_NAME = "catalog.ts";

export const API_TOKEN_VAR_NAME = "TIGER_API_TOKEN";

export const DEFAULT_CONFIG: CatalogExportConfig = {
    hostname: null,
    workspaceId: null,
    token: null,
    catalogOutput: null,
};
