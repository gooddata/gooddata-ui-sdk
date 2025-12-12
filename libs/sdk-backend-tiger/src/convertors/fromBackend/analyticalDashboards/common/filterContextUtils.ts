// (C) 2020-2025 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    AnalyticalDashboardModelV1,
    AnalyticalDashboardModelV2,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiFilterContextOutWithLinks,
    isFilterContextData,
} from "@gooddata/api-client-tiger";
import { type FilterContextItem, type IFilterContext, type ObjectType, idRef } from "@gooddata/sdk-model";

import { convertFilterContextFilters as convertFilterContextFiltersV1 } from "../v1/AnalyticalDashboardConverter.js";
import { convertFilterContextFilters as convertFilterContextFiltersV2 } from "../v2/FilterContextFiltersConverter.js";

/**
 * Get all filter contexts from included data.
 */
export function getFilterContextsFromIncluded(
    included: JsonApiAnalyticalDashboardOutDocument["included"],
): IFilterContext[] {
    const filterContexts =
        (included?.filter(isFilterContextData) as JsonApiFilterContextOutWithLinks[]) ?? [];
    return filterContexts.map((filterContext) => {
        return convertFilterContextFromIncluded(filterContext);
    });
}

/**
 * Get first filter context from included data.
 * Not useful for dashboard with tabs, as it returns always first filter context from included.
 * @deprecated Use getFilterContextsFromIncluded instead.
 */
export function getFilterContextFromIncluded(
    included: JsonApiAnalyticalDashboardOutDocument["included"],
): IFilterContext | undefined {
    const filterContext = included?.find(isFilterContextData) as JsonApiFilterContextOutWithLinks;
    if (!filterContext) {
        return;
    }

    return convertFilterContextFromIncluded(filterContext);
}

function convertFilterContextFromIncluded(filterContext: JsonApiFilterContextOutWithLinks): IFilterContext {
    const { id, type, attributes } = filterContext;
    const { title = "", description = "", content } = attributes!;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: filterContext.links!.self,
        title,
        description,
        filters: convertFilterContextFilters(
            content as AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
        ),
    };
}

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    if (AnalyticalDashboardModelV1.isFilterContext(content)) {
        return convertFilterContextFiltersV1(content);
    }

    if (AnalyticalDashboardModelV2.isFilterContext(content)) {
        return convertFilterContextFiltersV2(content);
    }

    invariant(false, "Unknown filter context version");
}
