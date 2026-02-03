// (C) 2025-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

import { type AxiosInstance, type AxiosPromise, type AxiosRequestConfig } from "axios";

import type { GeoJsonFeatureCollection } from "../../generated/result-json-api/api.js";

// Result API - Export ActionsApi functions with ResultApi_ prefix
// eslint-disable-next-line no-duplicate-imports -- Using both import and export from same module for re-exporting with aliases
export {
    ActionsApi_AnalyzeCsv as ResultApi_AnalyzeCsv,
    type ActionsApiAnalyzeCsvRequest as ResultApiAnalyzeCsvRequest,
    ActionsApi_CollectCacheUsage as ResultApi_CollectCacheUsage,
    ActionsApi_DeleteFiles as ResultApi_DeleteFiles,
    type ActionsApiDeleteFilesRequest as ResultApiDeleteFilesRequest,
    ActionsApi_ImportCsv as ResultApi_ImportCsv,
    type ActionsApiImportCsvRequest as ResultApiImportCsvRequest,
    ActionsApi_ListFiles as ResultApi_ListFiles,
    type ActionsApiListFilesRequest as ResultApiListFilesRequest,
    ActionsApi_ReadCsvFileManifests as ResultApi_ReadCsvFileManifests,
    type ActionsApiReadCsvFileManifestsRequest as ResultApiReadCsvFileManifestsRequest,
    ActionsApi_StagingUpload as ResultApi_StagingUpload,
    type ActionsApiStagingUploadRequest as ResultApiStagingUploadRequest,
    OGCAPIFeaturesApi_GetCollectionItems as ResultApi_GetCollectionItems,
    type OGCAPIFeaturesApiGetCollectionItemsRequest as ResultApiGetCollectionItemsRequest,
} from "../../generated/result-json-api/api.js";

/**
 * Request parameters for getCustomCollectionItems operation.
 * @export
 * @interface IResultApiGetCustomCollectionItemsRequest
 */
export interface IResultApiGetCustomCollectionItemsRequest {
    /**
     * Collection identifier
     */
    readonly collectionId: string;

    /**
     * Maximum number of features to return
     */
    readonly limit?: number;

    /**
     * Bounding box filter (minx,miny,maxx,maxy)
     */
    readonly bbox?: string;

    /**
     * List of values to filter features by
     */
    readonly values?: Array<string>;
}

/**
 * Retrieve features from a custom (organization-scoped) GeoCollections collection as GeoJSON.
 * This endpoint is used for CUSTOM geo collections.
 *
 * @param axios Axios instance.
 * @param basePath Base path.
 * @param requestParameters Request parameters.
 * @param options Override http request option.
 * @throws {RequiredError}
 */
export async function ResultApi_GetCustomCollectionItems(
    axios: AxiosInstance,
    basePath: string,
    requestParameters: IResultApiGetCustomCollectionItemsRequest,
    options?: AxiosRequestConfig,
): AxiosPromise<GeoJsonFeatureCollection> {
    const { collectionId, limit, bbox, values } = requestParameters;

    const queryParams = new URLSearchParams();
    if (limit !== undefined) {
        queryParams.append("limit", String(limit));
    }
    if (bbox !== undefined) {
        queryParams.append("bbox", bbox);
    }
    if (values) {
        values.forEach((value) => queryParams.append("values", value));
    }

    const queryString = queryParams.toString();
    const encodedCollectionId = encodeURIComponent(collectionId);
    const queryPart = queryString ? `?${queryString}` : "";
    const url = `${basePath}/api/v1/location/custom/collections/${encodedCollectionId}/items${queryPart}`;

    return axios.get<GeoJsonFeatureCollection>(url, options);
}
