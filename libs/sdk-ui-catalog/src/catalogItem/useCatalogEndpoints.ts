// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type {
    IAttributesQueryResult,
    IDashboardsQueryResult,
    IDatasetsQueryResult,
    IFactsQueryResult,
    IInsightsQueryResult,
    IMeasuresQueryResult,
    IParametersQueryResult,
} from "@gooddata/sdk-backend-spi";
import type { IFeatureFlags, Identifier, ObjectOrigin } from "@gooddata/sdk-model";

import { ObjectTypes } from "../objectType/constants.js";
import { type ObjectType } from "../objectType/types.js";
import {
    getAttributesQuery,
    getDashboardsQuery,
    getDateDatasetsQuery,
    getFactsQuery,
    getInsightsQuery,
    getMetricsQuery,
    getParametersQuery,
} from "./query.js";
import type { ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "./types.js";

export type EndpointResult =
    | IMeasuresQueryResult
    | IDashboardsQueryResult
    | IFactsQueryResult
    | IInsightsQueryResult
    | IAttributesQueryResult
    | IDatasetsQueryResult
    | IParametersQueryResult;

export type FeedEndpoint = {
    type: ObjectType;
    query: () => Promise<EndpointResult>;
};

interface IFilterParam<T> {
    values: T;
    isInverted: boolean;
}

export interface ICatalogQueryFilterInputs {
    search: string;
    origin: ObjectOrigin;
    createdBy: IFilterParam<string[]>;
    tags: IFilterParam<string[]>;
    qualityIds: IFilterParam<Identifier[]> | undefined;
    isHidden: boolean | undefined;
    certification: boolean | undefined;
}

export function useCatalogQueryOptions(
    feedOptions: ICatalogItemFeedOptions,
    filterInputs: ICatalogQueryFilterInputs,
): ICatalogItemQueryOptions {
    const { backend, workspace, id, pageSize } = feedOptions;
    const { search, origin, createdBy, tags, qualityIds, isHidden, certification } = filterInputs;

    return useMemo<ICatalogItemQueryOptions>(() => {
        let includeIds: string[] | undefined = id;
        let excludeIds: string[] | undefined = undefined;

        if (qualityIds) {
            if (qualityIds.isInverted) {
                excludeIds = qualityIds.values;
            } else {
                includeIds = [...new Set([...qualityIds.values, ...(id ?? [])])];
            }
        }

        return {
            backend,
            workspace,
            search,
            origin,
            id: includeIds,
            excludeId: excludeIds,
            createdBy: createdBy.isInverted ? undefined : createdBy.values,
            excludeCreatedBy: createdBy.isInverted ? createdBy.values : undefined,
            tags: tags.isInverted ? undefined : tags.values,
            excludeTags: tags.isInverted ? tags.values : undefined,
            isHidden,
            certification,
            pageSize,
        };
    }, [
        backend,
        workspace,
        search,
        origin,
        id,
        createdBy,
        pageSize,
        tags,
        qualityIds,
        isHidden,
        certification,
    ]);
}

export interface ICatalogEndpoint {
    type: ObjectType;
    query: (opts: ICatalogItemQueryOptions) => Promise<EndpointResult>;
    gatedBy?: readonly (keyof IFeatureFlags)[];
    cannotFilterBy?: readonly FilterSlot[];
}

type FilterSlot = "createdBy" | "excludeCreatedBy" | "certification";

const ENDPOINTS: readonly ICatalogEndpoint[] = [
    {
        type: ObjectTypes.DASHBOARD,
        query: (opts) => getDashboardsQuery(opts).query(),
    },
    {
        type: ObjectTypes.VISUALIZATION,
        query: (opts) => getInsightsQuery(opts).query(),
    },
    {
        type: ObjectTypes.METRIC,
        query: (opts) => getMetricsQuery(opts).query(),
    },
    {
        type: ObjectTypes.PARAMETER,
        query: (opts) => getParametersQuery(opts).query(),
        gatedBy: ["enableParameters"],
    },
    {
        type: ObjectTypes.ATTRIBUTE,
        query: (opts) => getAttributesQuery(opts).query(),
        cannotFilterBy: ["createdBy", "excludeCreatedBy", "certification"],
    },
    {
        type: ObjectTypes.FACT,
        query: (opts) => getFactsQuery(opts).query(),
        cannotFilterBy: ["createdBy", "excludeCreatedBy", "certification"],
    },
    {
        type: ObjectTypes.DATASET,
        query: (opts) => getDateDatasetsQuery(opts).query(),
        cannotFilterBy: ["createdBy", "excludeCreatedBy", "certification"],
    },
];

export function useCatalogEndpoints(
    types: ObjectType[],
    queryOptions: ICatalogItemQueryOptions,
    flags: IFeatureFlags | undefined,
): FeedEndpoint[] {
    return useMemo(() => selectCatalogEndpoints(types, queryOptions, flags), [flags, queryOptions, types]);
}

export function selectCatalogEndpoints(
    types: readonly ObjectType[],
    options: ICatalogItemQueryOptions,
    flags: IFeatureFlags | undefined,
    endpoints: readonly ICatalogEndpoint[] = ENDPOINTS,
): FeedEndpoint[] {
    if (options.id?.length === 0) {
        return [];
    }
    const result: FeedEndpoint[] = [];
    for (const endpoint of endpoints) {
        // types rule: empty = all
        if (types.length > 0 && !types.includes(endpoint.type)) {
            continue;
        }
        // gates rule: every listed flag must be on
        if (endpoint.gatedBy?.some((flag) => !flags?.[flag])) {
            continue;
        }
        // compatibility rule: backend rejects these filters on this endpoint
        if (endpoint.cannotFilterBy?.some((slot) => isSlotActive[slot](options))) {
            continue;
        }
        result.push({ type: endpoint.type, query: () => endpoint.query(options) });
    }
    return result;
}

const isSlotActive: Record<FilterSlot, (opts: ICatalogItemQueryOptions) => boolean> = {
    createdBy: (options) => (options.createdBy?.length ?? 0) > 0,
    excludeCreatedBy: (options) => (options.excludeCreatedBy?.length ?? 0) > 0,
    certification: (options) => Boolean(options.certification),
};
