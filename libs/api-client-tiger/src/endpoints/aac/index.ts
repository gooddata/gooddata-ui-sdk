// (C) 2025-2026 GoodData Corporation

import type { AxiosInstance, AxiosPromise, AxiosRequestConfig } from "axios";

export type AacAnalyticsModelExclude = "ACTIVITY_INFO";

/**
 * AAC analytics model representation compatible with Analytics-as-Code YAML format.
 *
 * Note: The backend returns JSON (`application/json`). The shape is intentionally
 * permissive so we can expose the endpoint without requiring a full regenerated
 * OpenAPI client.
 */
export interface IAacAnalyticsModel {
    metrics?: unknown[];
    visualizations?: unknown[];
    dashboards?: unknown[];
    plugins?: unknown[];
    attribute_hierarchies?: unknown[];
    [key: string]: unknown;
}

/**
 * AAC logical data model representation compatible with Analytics-as-Code YAML format.
 *
 * Note: The backend returns JSON (`application/json`). The shape is intentionally
 * permissive so we can expose the endpoint without requiring a full regenerated
 * OpenAPI client.
 */
export interface IAacLogicalModel {
    datasets?: unknown[];
    date_datasets?: unknown[];
    [key: string]: unknown;
}

export interface IAacApiGetAnalyticsModelAacRequest {
    readonly workspaceId: string;
    readonly exclude?: Array<AacAnalyticsModelExclude>;
}

export interface IAacApiSetAnalyticsModelAacRequest {
    readonly workspaceId: string;
    readonly aacAnalyticsModel: IAacAnalyticsModel;
}

export interface IAacApiGetLogicalModelAacRequest {
    readonly workspaceId: string;
    readonly includeParents?: boolean;
}

export interface IAacApiSetLogicalModelAacRequest {
    readonly workspaceId: string;
    readonly aacLogicalModel: IAacLogicalModel;
}

const toPathString = (url: URL): string => `${url.pathname}${url.search}${url.hash}`;

type QueryParamValue = string | number | boolean;

const buildUrlWithParams = (
    path: string,
    query: Record<string, QueryParamValue | QueryParamValue[] | undefined | null>,
): string => {
    const url = new URL(path, "https://dummy-base.invalid");

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                url.searchParams.append(key, `${item}`);
            });
            return;
        }

        url.searchParams.set(key, `${value}`);
    });

    return toPathString(url);
};

export function AacApi_GetAnalyticsModelAac(
    axios: AxiosInstance,
    basePath: string,
    requestParameters: IAacApiGetAnalyticsModelAacRequest,
    options: AxiosRequestConfig = {},
): AxiosPromise<IAacAnalyticsModel> {
    const path = `/api/v1/aac/workspaces/${encodeURIComponent(requestParameters.workspaceId)}/analyticsModel`;
    const url = `${basePath}${buildUrlWithParams(path, { exclude: requestParameters.exclude })}`;
    return axios.request<IAacAnalyticsModel>({ ...options, method: "GET", url });
}

export function AacApi_SetAnalyticsModelAac(
    axios: AxiosInstance,
    basePath: string,
    requestParameters: IAacApiSetAnalyticsModelAacRequest,
    options: AxiosRequestConfig = {},
): AxiosPromise<void> {
    const path = `/api/v1/aac/workspaces/${encodeURIComponent(requestParameters.workspaceId)}/analyticsModel`;
    const url = `${basePath}${path}`;
    return axios.request<void>({
        ...options,
        method: "PUT",
        url,
        data: requestParameters.aacAnalyticsModel,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });
}

export function AacApi_GetLogicalModelAac(
    axios: AxiosInstance,
    basePath: string,
    requestParameters: IAacApiGetLogicalModelAacRequest,
    options: AxiosRequestConfig = {},
): AxiosPromise<IAacLogicalModel> {
    const path = `/api/v1/aac/workspaces/${encodeURIComponent(requestParameters.workspaceId)}/logicalModel`;
    const url = `${basePath}${buildUrlWithParams(path, { includeParents: requestParameters.includeParents })}`;
    return axios.request<IAacLogicalModel>({ ...options, method: "GET", url });
}

export function AacApi_SetLogicalModelAac(
    axios: AxiosInstance,
    basePath: string,
    requestParameters: IAacApiSetLogicalModelAacRequest,
    options: AxiosRequestConfig = {},
): AxiosPromise<void> {
    const path = `/api/v1/aac/workspaces/${encodeURIComponent(requestParameters.workspaceId)}/logicalModel`;
    const url = `${basePath}${path}`;
    return axios.request<void>({
        ...options,
        method: "PUT",
        url,
        data: requestParameters.aacLogicalModel,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });
}
