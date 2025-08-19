// (C) 2023-2025 GoodData Corporation
import { AxiosInstance } from "axios";

import {
    ActionsApi,
    ActionsApiAnalyzeCsvRequest,
    ActionsApiImportCsvRequest,
    ActionsApiInterface,
    AnalyzeCsvRequest,
    AnalyzeCsvRequestItem,
    AnalyzeCsvRequestItemConfig,
    AnalyzeCsvResponse,
    GdStorageFile,
    ImportCsvRequestTable,
    ImportCsvRequestTableSource,
    ImportCsvRequestTableSourceConfig,
    ReadCsvFileManifestsResponse,
} from "./generated/result-json-api/index.js";

export const tigerResultClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);

export type {
    ActionsApiInterface as ResultActionsApiInterface,
    ActionsApiAnalyzeCsvRequest,
    AnalyzeCsvResponse,
    AnalyzeCsvRequest,
    AnalyzeCsvRequestItem,
    AnalyzeCsvRequestItemConfig,
    ActionsApiImportCsvRequest,
    ImportCsvRequestTable,
    ImportCsvRequestTableSource,
    ImportCsvRequestTableSourceConfig,
    GdStorageFile,
    ReadCsvFileManifestsResponse,
};
