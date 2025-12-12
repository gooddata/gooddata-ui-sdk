// (C) 2023-2025 GoodData Corporation

import { type AxiosInstance } from "axios";

import {
    ActionsApi,
    type ActionsApiAnalyzeCsvRequest,
    type ActionsApiImportCsvRequest,
    type ActionsApiInterface,
    type AnalyzeCsvRequest,
    type AnalyzeCsvRequestItem,
    type AnalyzeCsvRequestItemConfig,
    type AnalyzeCsvResponse,
    type GdStorageFile,
    type ImportCsvRequestTable,
    type ImportCsvRequestTableSource,
    type ImportCsvRequestTableSourceConfig,
    OGCAPIFeaturesApi,
    type OGCAPIFeaturesApiInterface,
    type OGCAPIFeaturesApi_GetCollectionItems,
    type ReadCsvFileManifestsResponse,
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
