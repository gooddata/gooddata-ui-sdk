// (C) 2019-2025 GoodData Corporation

import { AxiosInstance, AxiosPromise, GenericAbortSignal } from "axios";
import { merge, uniqBy } from "lodash-es";

import { ITigerClientBase } from "./client.js";
import { jsonApiHeaders } from "./constants.js";
import {
    JsonApiAnalyticalDashboardOutList,
    JsonApiApiTokenOutList,
    JsonApiAttributeOutList,
    JsonApiAutomationOutList,
    JsonApiColorPaletteOutList,
    JsonApiDashboardPluginOutList,
    JsonApiDatasetOutList,
    JsonApiExportDefinitionOutList,
    JsonApiFactOutList,
    JsonApiFilterContextOutList,
    JsonApiLabelOutList,
    JsonApiMetricOutList,
    JsonApiNotificationChannelIdentifierOutList,
    JsonApiNotificationChannelOutList,
    JsonApiThemeOutList,
    JsonApiUserOutList,
    JsonApiVisualizationObjectOutList,
} from "./generated/metadata-json-api/index.js";

const DefaultPageSize = 250;
const DefaultOptions = {
    headers: jsonApiHeaders,
    params: {
        size: DefaultPageSize,
    },
};

function createOptionsForPage(page: number, options: MetadataGetEntitiesOptions): MetadataGetEntitiesOptions {
    return merge({}, DefaultOptions, options, { params: { page } });
}

/**
 * Workspace get entities params
 *
 * @internal
 */
export type MetadataGetEntitiesWorkspaceParams = {
    workspaceId: string;
    filter?: string;
};

/**
 * User get entities params
 *
 * @internal
 */
export type MetadataGetEntitiesUserParams = {
    userId: string;
    filter?: string;
};

/**
 * Theme get entities params
 *
 * @internal
 */
export type MetadataGetEntitiesThemeParams = {
    filter?: string;
};

/**
 * Color palette get entities params
 *
 * @internal
 */
export type MetadataGetEntitiesColorPaletteParams = {
    filter?: string;
};

/**
 * Common parameters for all API client getEntities* parameters.
 *
 * Note: the different generated client functions are actually incorrect. They list page, size, include, sort in
 * the params, but they are not picked from there anyway. They need to be passed in options as query parameters.
 *
 * @internal
 */
export type MetadataGetEntitiesParams =
    | MetadataGetEntitiesWorkspaceParams
    | MetadataGetEntitiesUserParams
    | MetadataGetEntitiesThemeParams
    | MetadataGetEntitiesColorPaletteParams;

/**
 * Common parameters for all API client getEntities* parameters.
 *
 * @internal
 */
export type MetadataGetEntitiesOptions = {
    headers?: object;
    signal?: GenericAbortSignal;
    params?: {
        page?: number;
        size?: number;
        include?: any;
        sort?: any;
        tags?: any;
    };
};

/**
 * All possible responses of API client getEntities* functions.
 *
 * @internal
 */
export type MetadataGetEntitiesResult =
    | JsonApiVisualizationObjectOutList
    | JsonApiAnalyticalDashboardOutList
    | JsonApiDashboardPluginOutList
    | JsonApiDatasetOutList
    | JsonApiAttributeOutList
    | JsonApiLabelOutList
    | JsonApiMetricOutList
    | JsonApiFactOutList
    | JsonApiFilterContextOutList
    | JsonApiApiTokenOutList
    | JsonApiThemeOutList
    | JsonApiColorPaletteOutList
    | JsonApiExportDefinitionOutList
    | JsonApiAutomationOutList
    | JsonApiUserOutList
    | JsonApiNotificationChannelOutList
    | JsonApiNotificationChannelIdentifierOutList;

/**
 * All API client getEntities* functions follow this signature.
 *
 * @internal
 */
export type MetadataGetEntitiesFn<
    T extends MetadataGetEntitiesResult,
    P extends MetadataGetEntitiesParams,
> = (params: P, options: MetadataGetEntitiesOptions) => AxiosPromise<T>;

export type MetadataGetEntitiesFnNew<
    T extends MetadataGetEntitiesResult,
    P extends MetadataGetEntitiesParams,
> = (
    axios: AxiosInstance,
    basePath: string,
    params: P,
    options: MetadataGetEntitiesOptions,
) => AxiosPromise<T>;

/**
 * Tiger metadata utility functions
 *
 * @internal
 */
export class MetadataUtilities {
    /**
     * Given a function to get a paged list of metadata entities, API call parameters and options, this function will
     * retrieve all pages from the metadata.
     *
     * The parameters are passed to the function as is. The options will be used as a 'template'. If the options specify
     * page `size`, it will be retained and used for paging. Otherwise, the size will be set to a default value (250). The
     * `page` number will be added dynamically upon each page request.
     *
     * @param client - API client to use, this is required so that function can correctly bind 'this' for
     *  the entitiesGet function
     * @param entitiesGet - function to get pages list of entities
     * @param params - parameters accepted by the function
     * @param options - options accepted by the function
     * @internal
     */
    /*public static getAllPagesOf = async <
        T extends MetadataGetEntitiesResult,
        P extends MetadataGetEntitiesParams,
    >(
        client: ITigerClient,
        entitiesGet: MetadataGetEntitiesFn<T, P>,
        params: P,
        options: MetadataGetEntitiesOptions = {},
    ): Promise<T[]> => {
        const boundGet = entitiesGet.bind(client.entities);
        const results: T[] = [];
        const pageSize = options.params?.size ?? DefaultPageSize;
        let reachedEnd = false;
        let nextPage: number = 0;

        while (!reachedEnd) {
            const optionsToUse = createOptionsForPage(nextPage, options);
            const result = await boundGet(params, optionsToUse);

            results.push(result.data);

            if (result.data.data.length < pageSize) {
                reachedEnd = true;
            } else {
                nextPage += 1;
            }
        }

        return results;
    };*/

    /**
     * Given a function to get a paged list of metadata entities, API call parameters and options, this function will
     * retrieve all pages from the metadata.
     * Unlike to the getAllPagesOf, the requests will not be done in series. Instead, a first request will be done
     * with metaInclude=page to get the number of pages and all subsequent pages will be fetched in parallel.
     *
     * The parameters are passed to the function as is. The options will be used as a 'template'. If the options specify
     * page `size`, it will be retained and used for paging.
     *
     * @param client - API client to use, this is required so that function can correctly bind 'this' for
     *  the entitiesGet function
     * @param entitiesGet - function to get pages list of entities
     * @param params - parameters accepted by the function
     * @param options - options accepted by the function
     * @internal
     */
    /* public static getAllPagesOfParallel = async <
        T extends MetadataGetEntitiesResult,
        P extends MetadataGetEntitiesParams,
    >(
        client: ITigerClient,
        entitiesGet: MetadataGetEntitiesFn<T, P>,
        params: P,
        options: MetadataGetEntitiesOptions = {},
    ): Promise<T[]> => {
        const boundGet = entitiesGet.bind(client.entities);

        const initialOptions = createOptionsForPage(0, options);
        const initialGet = await boundGet({ ...params, metaInclude: ["page"] }, initialOptions);

        const total = initialGet.data?.meta?.page?.totalPages || 1;

        const range = Array.from({ length: total - 1 }, (_v, i) => i + 1);

        const morePages = await Promise.all(
            range.map((page) => {
                const optionsToUse = createOptionsForPage(page, options);
                return boundGet(params, optionsToUse);
            }),
        );

        return [initialGet, ...morePages].map((item) => item.data);
    }; */

    /**
     * This function merges multiple pages containing metadata entities into a single page. The entity data from different
     * pages are concatenated. The side-loaded entities are concatenated and their uniqueness is ensured so that same
     * entity side-loaded on multiple pages only appears once.
     *
     * The merges result WILL NOT contain any links section.
     *
     * @param pages - pages to merge
     * @internal
     */
    public static mergeEntitiesResults<T extends MetadataGetEntitiesResult>(pages: T[]): T {
        return {
            data: pages.flatMap((page: any) => page.data) as any,
            included: uniqBy(
                // we need the as any because the JsonApiDashboardPluginOutList does not have the "included" property
                pages.flatMap((page: any) => (page as any).included ?? []),
                (item: any) => `${item.id}_${item.type}`,
            ) as any,
        } as T;
    }

    /**
     * Given list of JSON API entities, return those which have not broken relations to other MD objects. This
     * info is computed by backend when "X-GDC-VALIDATE-RELATIONS" is sent with the GET request. Note that backend
     * checks the relations recursively.
     *
     * @param result - MetadataGetEntitiesResult
     */
    public static filterValidEntities<T extends MetadataGetEntitiesResult>(result: T): T {
        result.data = (result.data as any[]).filter((entity) => entity.attributes?.areRelationsValid ?? true);
        return result;
    }

    public static getAllPagesOf = async <
        T extends MetadataGetEntitiesResult,
        P extends MetadataGetEntitiesParams,
    >(
        client: ITigerClientBase,
        entitiesGet: MetadataGetEntitiesFnNew<T, P>,
        params: P,
        options: MetadataGetEntitiesOptions = {},
    ): Promise<T[]> => {
        const results: T[] = [];
        const pageSize = options.params?.size ?? DefaultPageSize;
        let reachedEnd = false;
        let nextPage: number = 0;

        while (!reachedEnd) {
            const optionsToUse = createOptionsForPage(nextPage, options);
            const result = await entitiesGet(client.axios, "", params, optionsToUse);

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
     * Given a function to get a paged list of metadata entities, API call parameters and options, this function will
     * retrieve all pages from the metadata.
     * Unlike to the getAllPagesOf, the requests will not be done in series. Instead, a first request will be done
     * with metaInclude=page to get the number of pages and all subsequent pages will be fetched in parallel.
     *
     * The parameters are passed to the function as is. The options will be used as a 'template'. If the options specify
     * page `size`, it will be retained and used for paging.
     *
     * @param client - API client to use, this is required so that function can correctly bind 'this' for
     *  the entitiesGet function
     * @param entitiesGet - function to get pages list of entities
     * @param params - parameters accepted by the function
     * @param options - options accepted by the function
     * @internal
     */
    public static getAllPagesOfParallel = async <
        T extends MetadataGetEntitiesResult,
        P extends MetadataGetEntitiesParams,
    >(
        client: ITigerClientBase,
        entitiesGet: MetadataGetEntitiesFnNew<T, P>,
        params: P,
        options: MetadataGetEntitiesOptions = {},
    ): Promise<T[]> => {
        const initialOptions = createOptionsForPage(0, options);
        const initialGet = await entitiesGet(
            client.axios,
            "",
            { ...params, metaInclude: ["page"] },
            initialOptions,
        );

        const total = initialGet.data?.meta?.page?.totalPages || 1;

        const range = Array.from({ length: total - 1 }, (_v, i) => i + 1);

        const morePages = await Promise.all(
            range.map((page) => {
                const optionsToUse = createOptionsForPage(page, options);
                return entitiesGet(client.axios, "", params, optionsToUse);
            }),
        );

        return [initialGet, ...morePages].map((item) => item.data);
    };
}
