// (C) 2019-2026 GoodData Corporation

import { type AxiosInstance, type AxiosPromise, type AxiosRequestConfig } from "axios";
import { merge, uniqBy } from "lodash-es";

import { type ITigerClientBase } from "./client.js";
import {
    type EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest,
    type EntitiesApiGetAllEntitiesAttributesRequest,
    type EntitiesApiGetAllEntitiesDashboardPluginsRequest,
    type EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    type EntitiesApiGetAllEntitiesFactsRequest,
    type EntitiesApiGetAllEntitiesMetricsRequest,
    type EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
    type EntitiesApiGetAllEntitiesWorkspacesRequest,
    type JsonApiDataSourceIdentifierOutList,
    type JsonApiUserGroupOutList,
    type JsonApiUserOutList,
    type JsonApiWorkspaceOutList,
} from "./generated/metadata-json-api/index.js";

const DefaultPageSize = 250;

/**
 * All possible responses of API client getEntities* functions which support `included` field
 *
 * @internal
 */
export type OrganizationGetEntitiesSupportingIncludedResult =
    | JsonApiUserOutList
    | JsonApiUserGroupOutList
    | JsonApiWorkspaceOutList;

/**
 * All possible responses of API client getEntities* functions.
 *
 * @internal
 */
export type OrganizationGetEntitiesResult =
    | JsonApiDataSourceIdentifierOutList
    | OrganizationGetEntitiesSupportingIncludedResult;

/**
 * All possible params of API client getEntities* functions.
 *
 * @internal
 */
export type OrganizationGetEntitiesParams =
    | EntitiesApiGetAllEntitiesAttributesRequest
    | EntitiesApiGetAllEntitiesFactsRequest
    | EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest
    | EntitiesApiGetAllEntitiesDashboardPluginsRequest
    | EntitiesApiGetAllEntitiesVisualizationObjectsRequest
    | EntitiesApiGetAllEntitiesMetricsRequest
    | EntitiesApiGetAllEntitiesWorkspacesRequest
    | EntitiesApiGetAllEntitiesExportDefinitionsRequest;

/**
 * All API client getEntities* functions follow this signature.
 *
 * @internal
 */
export type OrganizationGetEntitiesFn<
    T extends OrganizationGetEntitiesResult,
    P extends OrganizationGetEntitiesParams,
> = (params: P, options: AxiosRequestConfig) => AxiosPromise<T>;

/**
 * All API client getEntities* functions follow this signature.
 *
 * @internal
 */
export type OrganizationGetEntitiesFnNew<
    T extends OrganizationGetEntitiesResult,
    P extends OrganizationGetEntitiesParams,
> = (axios: AxiosInstance, basePath: string, params: P, options: AxiosRequestConfig) => AxiosPromise<T>;

/**
 * Tiger organization utility functions
 *
 * @internal
 */
export class OrganizationUtilities {
    /**
     * Guard for recognizing entities which support `included` field.
     * @internal
     */
    private static supportsIncluded(
        entity: OrganizationGetEntitiesResult,
    ): entity is OrganizationGetEntitiesSupportingIncludedResult {
        return (entity as OrganizationGetEntitiesSupportingIncludedResult).included !== undefined;
    }

    public static getAllPagesOf = async <
        T extends OrganizationGetEntitiesResult,
        P extends OrganizationGetEntitiesParams,
    >(
        client: ITigerClientBase,
        entitiesGet: OrganizationGetEntitiesFnNew<T, P>,
        params: P,
        options: AxiosRequestConfig = {},
    ): Promise<T[]> => {
        const results: T[] = [];
        const pageSize = params?.size ?? DefaultPageSize;
        let reachedEnd = false;
        let nextPage: number = 0;

        while (!reachedEnd) {
            const result = await entitiesGet(
                client.axios,
                "",
                { ...params, page: nextPage, size: pageSize },
                merge({}, options),
            );

            results.push(result.data);

            if (result.data.data.length < pageSize) {
                reachedEnd = true;
            } else {
                nextPage += 1;
            }
        }

        return results;
    };

    /**
     * This function merges multiple pages containing metadata entities into a single page. The entity data from different
     * pages are concatenated. The side-loaded entities are concatenated and their uniqueness is ensured so that same
     * entity sideloaded on multiple pages only appears once.
     *
     * The merges result WILL NOT contain any links section.
     *
     * @param pages - pages to merge
     * @internal
     */
    public static mergeEntitiesResults<T extends OrganizationGetEntitiesResult>(pages: T[]): T {
        return {
            data: pages.flatMap((page: any) => page.data) as any,
            included: uniqBy(
                pages.flatMap((page): any =>
                    OrganizationUtilities.supportsIncluded(page) ? (page.included ?? []) : [],
                ),
                (item: any) => `${item.id}_${item.type}`,
            ) as any,
        } as T;
    }
}
