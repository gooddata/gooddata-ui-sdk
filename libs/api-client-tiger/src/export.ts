// (C) 2019-2025 GoodData Corporation
import { type AxiosInstance } from "axios";

import { ActionsExport, type ActionsExportInterface } from "./generated/export-json-api/api.js";

export const tigerExportClientFactory = (axios: AxiosInstance): ActionsExportInterface =>
    new ActionsExport(undefined, "", axios);
