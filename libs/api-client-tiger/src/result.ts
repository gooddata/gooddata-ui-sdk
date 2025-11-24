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
    OGCAPIFeaturesApi,
    OGCAPIFeaturesApiInterface,
    OGCAPIFeaturesApi_GetCollectionItems,
    ReadCsvFileManifestsResponse,
} from "./generated/result-json-api/index.js";

export const tigerResultClientFactory = (axios: AxiosInstance): ActionsApiInterface =>
    new ActionsApi(undefined, "", axios);

export const tigerGeoCollectionsClientFactory = (axios: AxiosInstance): OGCAPIFeaturesApiInterface =>
    new OGCAPIFeaturesApi(undefined, "", axios);

export type {
    ActionsApiInterface as ResultActionsApiInterface,
    OGCAPIFeaturesApiInterface as ResultGeoCollectionsApiInterface,
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
    OGCAPIFeaturesApi_GetCollectionItems,
};
