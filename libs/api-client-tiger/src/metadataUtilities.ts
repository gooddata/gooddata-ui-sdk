// (C) 2019-2026 GoodData Corporation

import { type AxiosInstance, type AxiosPromise, type GenericAbortSignal } from "axios";

import { _merge, _uniq, _uniqBy } from "@gooddata/util";

import { type ITigerClientBase } from "./client.js";
import {
    type JsonApiAnalyticalDashboardOutList,
    type JsonApiApiTokenOutList,
    type JsonApiAttributeOutList,
    type JsonApiAutomationOutList,
    type JsonApiColorPaletteOutList,
    type JsonApiComputedAttributeOutList,
    type JsonApiDashboardPluginOutList,
    type JsonApiDatasetOutList,
    type JsonApiExportDefinitionOutList,
    type JsonApiFactOutList,
    type JsonApiFilterContextOutList,
    type JsonApiLabelOutList,
    type JsonApiMetricOutList,
    type JsonApiNotificationChannelIdentifierOutList,
    type JsonApiNotificationChannelOutList,
    type JsonApiThemeOutList,
    type JsonApiUserDataFilterOutList,
    type JsonApiUserOutList,
    type JsonApiVisualizationObjectOutList,
    type JsonApiWorkspaceColorPaletteOutList,
    type JsonApiWorkspaceDataFilterOutList,
    type JsonApiWorkspaceThemeOutList,
} from "./generated/metadata-json-api/index.js";

const DefaultPageSize = 250;
const DefaultOptions = {
    params: {
        size: DefaultPageSize,
    },
};
// pages are heavy backend requests (e.g. with X-GDC-VALIDATE-RELATIONS), so never fire all of them at once
const MaxParallelPageRequests = 4;

function createOptionsForPage(page: number, options: MetadataGetEntitiesOptions): MetadataGetEntitiesOptions {
    return _merge({}, DefaultOptions, options, { params: { page } });
}

// keeps whatever meta the caller asked for (e.g. permissions) next to the page count
function withPageMeta<P extends MetadataGetEntitiesParams>(params: P): P {
    const { metaInclude = [] } = params as { metaInclude?: string[] };
    return { ...params, metaInclude: _uniq([...metaInclude, "page"]) };
}

// requests the pages following `loadedPages` one by one until the backend returns a page that is not full
async function getRemainingPagesInSeries<
    T extends MetadataGetEntitiesResult,
    P extends MetadataGetEntitiesParams,
>(
    client: ITigerClientBase,
    entitiesGet: MetadataGetEntitiesFnNew<T, P>,
    params: P,
    options: MetadataGetEntitiesOptions,
    loadedPages: T[],
): Promise<T[]> {
    const pages = [...loadedPages];
    const pageSize = options.params?.size ?? DefaultPageSize;

    while (pages.length === 0 || pages[pages.length - 1].data.length >= pageSize) {
        const result = await entitiesGet(
            client.axios,
            "",
            params,
            createOptionsForPage(pages.length, options),
        );
        pages.push(result.data);
    }

    return pages;
}

// runs at most `limit` tasks at a time and starts no new task once one of them fails
async function runWithConcurrencyLimit<R>(tasks: Array<() => Promise<R>>, limit: number): Promise<R[]> {
    const results: R[] = [];
    let nextTask = 0;
    let failed = false;

    const worker = async () => {
        while (!failed && nextTask < tasks.length) {
            const index = nextTask++;
            try {
                results[index] = await tasks[index]();
            } catch (e) {
                failed = true;
                throw e;
            }
        }
    };

    await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
    return results;
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
    | JsonApiComputedAttributeOutList
    | JsonApiLabelOutList
    | JsonApiMetricOutList
    | JsonApiFactOutList
    | JsonApiFilterContextOutList
    | JsonApiApiTokenOutList
    | JsonApiThemeOutList
    | JsonApiColorPaletteOutList
    | JsonApiWorkspaceThemeOutList
    | JsonApiWorkspaceColorPaletteOutList
    | JsonApiExportDefinitionOutList
    | JsonApiAutomationOutList
    | JsonApiUserOutList
    | JsonApiUserDataFilterOutList
    | JsonApiWorkspaceDataFilterOutList
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

/**
 * @internal
 */
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
            included: _uniqBy(
                // we need the as any because the JsonApiDashboardPluginOutList does not have the "included" property
                pages.flatMap((page: any) => page.included ?? []),
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
        return getRemainingPagesInSeries(client, entitiesGet, params, options, []);
    };

    /**
     * Given a function to get a paged list of metadata entities, API call parameters and options, this function will
     * retrieve all pages from the metadata.
     * Unlike to the getAllPagesOf, the requests will not be done in series. Instead, a first request will be done
     * with metaInclude=page to get the number of pages and the subsequent pages will be fetched in parallel,
     * at most four at a time. Once a page fails, no further pages are requested.
     *
     * The parameters are passed to the function as is; `page` is added to any `metaInclude` they already contain.
     * The options will be used as a 'template'. If the options specify page `size`, it will be retained and used
     * for paging.
     *
     * When the backend does not return the number of pages, the subsequent pages are fetched in series until
     * a page that is not full, the same way as getAllPagesOf does.
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
        const initialGet = await entitiesGet(
            client.axios,
            "",
            withPageMeta(params),
            createOptionsForPage(0, options),
        );

        const total = initialGet.data.meta?.page?.totalPages;
        if (total === undefined) {
            return getRemainingPagesInSeries(client, entitiesGet, params, options, [initialGet.data]);
        }

        const range = Array.from({ length: Math.max(total - 1, 0) }, (_v, i) => i + 1);

        const morePages = await runWithConcurrencyLimit(
            range.map(
                (page) => () => entitiesGet(client.axios, "", params, createOptionsForPage(page, options)),
            ),
            MaxParallelPageRequests,
        );

        return [initialGet, ...morePages].map((item) => item.data);
    };
}
