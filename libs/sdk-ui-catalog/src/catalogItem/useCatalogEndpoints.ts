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
import type { Identifier, ObjectOrigin } from "@gooddata/sdk-model";

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

export interface ICatalogEndpointsGates {
    isParametersEnabled: boolean;
}

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

export function useCatalogEndpoints(
    types: ObjectType[],
    queryOptions: ICatalogItemQueryOptions,
    gates: ICatalogEndpointsGates,
): FeedEndpoint[] {
    const { isParametersEnabled } = gates;

    return useMemo(() => {
        if (queryOptions.id?.length === 0) {
            return [];
        }

        const endpoints: FeedEndpoint[] = [];

        if (types.includes(ObjectTypes.DASHBOARD) || types.length === 0) {
            endpoints.push({
                query: () => getDashboardsQuery(queryOptions).query(),
                type: ObjectTypes.DASHBOARD,
            });
        }
        if (types.includes(ObjectTypes.VISUALIZATION) || types.length === 0) {
            endpoints.push({
                query: () => getInsightsQuery(queryOptions).query(),
                type: ObjectTypes.VISUALIZATION,
            });
        }
        if (types.includes(ObjectTypes.METRIC) || types.length === 0) {
            endpoints.push({
                query: () => getMetricsQuery(queryOptions).query(),
                type: ObjectTypes.METRIC,
            });
        }
        if (isParametersEnabled && (types.includes(ObjectTypes.PARAMETER) || types.length === 0)) {
            endpoints.push({
                query: () => getParametersQuery(queryOptions).query(),
                type: ObjectTypes.PARAMETER,
            });
        }
        if (
            !queryOptions.createdBy?.length &&
            !queryOptions.excludeCreatedBy?.length &&
            !queryOptions.certification
        ) {
            if (types.includes(ObjectTypes.ATTRIBUTE) || types.length === 0) {
                endpoints.push({
                    query: () => getAttributesQuery(queryOptions).query(),
                    type: ObjectTypes.ATTRIBUTE,
                });
            }
            if (types.includes(ObjectTypes.FACT) || types.length === 0) {
                endpoints.push({
                    query: () => getFactsQuery(queryOptions).query(),
                    type: ObjectTypes.FACT,
                });
            }
            if (types.includes(ObjectTypes.DATASET) || types.length === 0) {
                endpoints.push({
                    query: () => getDateDatasetsQuery(queryOptions).query(),
                    type: ObjectTypes.DATASET,
                });
            }
        }

        return endpoints;
    }, [isParametersEnabled, queryOptions, types]);
}
