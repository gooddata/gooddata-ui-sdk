// (C) 2019-2022 GoodData Corporation

import { AxiosPromise, AxiosRequestConfig } from "axios";
import flatMap from "lodash/flatMap.js";
import merge from "lodash/merge.js";
import uniqBy from "lodash/uniqBy.js";
import { ITigerClient } from "./client.js";
import { jsonApiHeaders } from "./constants.js";
import {
    JsonApiUserOutList,
    JsonApiUserGroupOutList,
    JsonApiWorkspaceOutList,
    JsonApiDataSourceIdentifierOutList,
    EntitiesApiGetAllEntitiesWorkspacesRequest,
    EntitiesApiGetAllEntitiesAttributesRequest,
    EntitiesApiGetAllEntitiesFactsRequest,
    EntitiesApiGetAllEntitiesMetricsRequest,
    EntitiesApiGetAllEntitiesDashboardPluginsRequest,
    EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
    EntitiesApiGetAllEntitiesAnalyticalDashboardsRequest,
} from "./generated/metadata-json-api/index.js";

const DefaultPageSize = 250;
const DefaultOptions = {
    headers: jsonApiHeaders,
};

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
    | EntitiesApiGetAllEntitiesWorkspacesRequest;

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

    /**
     * Given a function to get a paged list of metadata entities, API call parameters and options, this function will
     * retrieve all pages from the metadata.
     *
     * The parameters are passed to the function as is. The options will be used as a 'template'. If the options specify
     * page `size`, it will be retained and used for paging. Otherwise the size will be set to a default value (250). The
     * `page` number will be added dynamically upon each page request.
     *
     * @param client - API client to use, this is required so that function can correctly bind 'this' for
     *  the entitiesGet function
     * @param entitiesGet - function to get pages list of entities
     * @param params - parameters accepted by the function
     * @param options - options accepted by the function
     * @internal
     */
    public static getAllPagesOf = async <
        T extends OrganizationGetEntitiesResult,
        P extends OrganizationGetEntitiesParams,
    >(
        client: ITigerClient,
        entitiesGet: OrganizationGetEntitiesFn<T, P>,
        params: P,
        options: AxiosRequestConfig = {},
    ): Promise<T[]> => {
        const boundGet = entitiesGet.bind(client.entities);
        const results: T[] = [];
        const pageSize = params?.size ?? DefaultPageSize;
        let reachedEnd = false;
        let nextPage: number = 0;

        while (!reachedEnd) {
            const result = await boundGet(
                { ...params, page: nextPage, size: pageSize },
                merge({}, DefaultOptions, options),
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
            data: flatMap(pages, (page) => page.data) as any,
            included: uniqBy(
                flatMap(pages, (page) =>
                    OrganizationUtilities.supportsIncluded(page) ? page.included ?? [] : [],
                ),
                (item: any) => `${item.id}_${item.type}`,
            ) as any,
        } as T;
    }
}
