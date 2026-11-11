// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import type {
    IAttributesQueryResult,
    IComputedAttributesQueryResult,
    IDashboardsQueryResult,
    IDatasetsQueryResult,
    IFactsQueryResult,
    IInsightsQueryResult,
    IMeasuresQueryResult,
    IParametersQueryResult,
    IPublisherDocumentsQueryResultV2,
} from "@gooddata/sdk-backend-spi";
import type { IFeatureFlags, Identifier, ObjectOrigin } from "@gooddata/sdk-model";

import { COMPUTED_ATTRIBUTE_FEATURE_FLAG } from "../computedAttribute/gate.js";
import { ObjectTypes } from "../objectType/constants.js";
import { type ObjectType } from "../objectType/types.js";
import { useFeatureFlag, useFeatureFlags } from "../permission/PermissionsContext.js";
import { isQualityReported } from "../quality/gate.js";

import {
    getAttributesQuery,
    getComputedAttributesQuery,
    getDashboardsQuery,
    getDateDatasetsQuery,
    getFactsQuery,
    getInsightsQuery,
    getMetricsQuery,
    getParametersQuery,
    queryDocuments,
} from "./query.js";
import type { ICatalogItemFeedOptions, ICatalogItemQueryOptions } from "./types.js";

export type EndpointResult =
    | IMeasuresQueryResult
    | IDashboardsQueryResult
    | IFactsQueryResult
    | IInsightsQueryResult
    | IAttributesQueryResult
    | IDatasetsQueryResult
    | IParametersQueryResult
    | IComputedAttributesQueryResult
    | IPublisherDocumentsQueryResultV2;

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
    // the detail panel reuses the listed item, so its permissions have to come with the list
    const loadPermissions = useFeatureFlag("enableMetricPermissions");
    const loadVisualizationPermissions = useFeatureFlag("enableVisualizationPermissions");

    return useMemo<ICatalogItemQueryOptions>(() => {
        return {
            backend,
            workspace,
            search,
            origin,
            id,
            qualityIds,
            createdBy: createdBy.isInverted ? undefined : createdBy.values,
            excludeCreatedBy: createdBy.isInverted ? createdBy.values : undefined,
            tags: tags.isInverted ? undefined : tags.values,
            excludeTags: tags.isInverted ? tags.values : undefined,
            isHidden,
            certification,
            pageSize,
            loadPermissions,
            loadVisualizationPermissions,
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
        loadPermissions,
        loadVisualizationPermissions,
    ]);
}

export interface ICatalogEndpoint {
    type: ObjectType;
    query: (opts: ICatalogItemQueryOptions, context: ICatalogEndpointContext) => Promise<EndpointResult>;
    gatedBy?: readonly (keyof IFeatureFlags)[];
    cannotFilterBy?: readonly FilterSlot[];
}

/**
 * What the endpoints need to know about the user.
 */
export interface ICatalogEndpointContext {
    /** Whose documents the user sees; undefined means all. */
    documentOwner?: string;
}

type FilterSlot = "createdBy" | "excludeCreatedBy" | "certification";

const ENDPOINTS: readonly ICatalogEndpoint[] = [
    {
        type: ObjectTypes.DASHBOARD,
        query: (opts) => getDashboardsQuery(opts).query(),
    },
    {
        type: ObjectTypes.DOCUMENT,
        query: (opts, { documentOwner }) => queryDocuments(opts, documentOwner),
        gatedBy: ["enableBusinessBriefingReportsApp", "enablePublisherV2", "enableCatalogDocuments"],
        cannotFilterBy: ["certification"],
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
        type: ObjectTypes.COMPUTED_ATTRIBUTE,
        query: (opts) => getComputedAttributesQuery(opts).query(),
        gatedBy: [COMPUTED_ATTRIBUTE_FEATURE_FLAG],
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
    documentOwner?: string,
): FeedEndpoint[] {
    return useMemo(
        () => selectCatalogEndpoints(types, queryOptions, flags, ENDPOINTS, { documentOwner }),
        [flags, queryOptions, types, documentOwner],
    );
}

const NO_CONTEXT: ICatalogEndpointContext = {};

export function useEnabledObjectTypes(): ObjectType[] {
    const flags = useFeatureFlags();
    return useMemo(
        () => ENDPOINTS.filter((endpoint) => isEndpointEnabled(endpoint, flags)).map(({ type }) => type),
        [flags],
    );
}

export function selectCatalogEndpoints(
    types: readonly ObjectType[],
    options: ICatalogItemQueryOptions,
    flags: IFeatureFlags | undefined,
    endpoints: readonly ICatalogEndpoint[] = ENDPOINTS,
    context: ICatalogEndpointContext = NO_CONTEXT,
): FeedEndpoint[] {
    const result: FeedEndpoint[] = [];
    for (const endpoint of endpoints) {
        // types rule: empty = all
        if (types.length > 0 && !types.includes(endpoint.type)) {
            continue;
        }
        // gates rule: every listed flag must be on
        if (!isEndpointEnabled(endpoint, flags)) {
            continue;
        }
        // compatibility rule: backend rejects these filters on this endpoint
        if (endpoint.cannotFilterBy?.some((slot) => isSlotActive[slot](options))) {
            continue;
        }
        // quality rule: the quality filter narrows the ids, and an empty id list matches nothing
        const endpointOptions = applyQualityIds(options, endpoint.type);
        if (!endpointOptions || endpointOptions.id?.length === 0) {
            continue;
        }
        result.push({ type: endpoint.type, query: () => endpoint.query(endpointOptions, context) });
    }
    return result;
}

function isEndpointEnabled(endpoint: ICatalogEndpoint, flags: IFeatureFlags | undefined): boolean {
    return !endpoint.gatedBy?.some((flag) => !flags?.[flag]);
}

const isSlotActive: Record<FilterSlot, (opts: ICatalogItemQueryOptions) => boolean> = {
    createdBy: (options) => (options.createdBy?.length ?? 0) > 0,
    excludeCreatedBy: (options) => (options.excludeCreatedBy?.length ?? 0) > 0,
    certification: (options) => Boolean(options.certification),
};

/**
 * The options with the quality filter folded into the ids, or undefined when no object of the type can match.
 * Objects outside the quality report have no issues: "with issues" matches none, "without issues" all.
 */
function applyQualityIds(
    options: ICatalogItemQueryOptions,
    type: ObjectType,
): ICatalogItemQueryOptions | undefined {
    const { qualityIds } = options;
    if (!qualityIds) {
        return options;
    }
    if (!isQualityReported(type)) {
        return qualityIds.isInverted ? options : undefined;
    }
    if (qualityIds.isInverted) {
        return { ...options, excludeId: qualityIds.values };
    }
    return { ...options, id: [...new Set([...qualityIds.values, ...(options.id ?? [])])] };
}
