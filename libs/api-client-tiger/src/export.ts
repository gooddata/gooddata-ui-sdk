// (C) 2019-2025 GoodData Corporation
import { AxiosInstance } from "axios";
import { ActionsExport, ActionsExportInterface } from "./generated/export-json-api/api.js";

export const tigerExportClientFactory = (axios: AxiosInstance): ActionsExportInterface =>
    new ActionsExport(undefined, "", axios);
