// (C) 2020-2021 GoodData Corporation
import invariant from "ts-invariant";
import {
    AnalyticalDashboardModelV1,
    AnalyticalDashboardModelV2,
    isFilterContextData,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiAnalyticalDashboardOutList,
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiFilterContextOutDocument,
    JsonApiFilterContextOutWithLinks,
} from "@gooddata/api-client-tiger";
import { FilterContextItem, IDashboard, IFilterContext, IListedDashboard } from "@gooddata/sdk-backend-spi";

import {
    convertDashboard as convertDashboardV1,
    convertFilterContextFilters as convertFilterContextFiltersV1,
    convertFilterContextFromBackend as convertFilterContextFromBackendV1,
} from "./v1/AnalyticalDashboardConverter";
import {
    convertDashboard as convertDashboardV2,
    convertFilterContextFilters as convertFilterContextFiltersV2,
    convertFilterContextFromBackend as convertFilterContextFromBackendV2,
} from "./v2/AnalyticalDashboardConverter";
import { idRef, ObjectType } from "@gooddata/sdk-model";
import { isInheritedObject } from "../utils";

export const convertAnalyticalDashboard = (
    analyticalDashboard: JsonApiAnalyticalDashboardOutWithLinks,
): IListedDashboard => {
    const attributes = analyticalDashboard.attributes;
    return {
        ref: idRef(analyticalDashboard.id, "analyticalDashboard"),
        uri: analyticalDashboard.links!.self,
        identifier: analyticalDashboard.id,
        title: attributes?.title ?? "",
        description: attributes?.description ?? "",
        created: "",
        updated: "",
        tags: attributes?.tags ?? [],
        isLocked: isInheritedObject(analyticalDashboard.id),
        shareStatus: "public",
        isUnderStrictControl: true,
    };
};

export const convertAnalyticalDashboardToListItems = (
    analyticalDashboards: JsonApiAnalyticalDashboardOutList,
): IListedDashboard[] => {
    return analyticalDashboards.data.map(convertAnalyticalDashboard);
};

export function convertDashboard(
    analyticalDashboard: JsonApiAnalyticalDashboardOutDocument,
    filterContext?: IFilterContext,
): IDashboard {
    const content = analyticalDashboard.data.attributes!.content;

    if (AnalyticalDashboardModelV1.isAnalyticalDashboard(content)) {
        return convertDashboardV1(analyticalDashboard, filterContext);
    }

    if (AnalyticalDashboardModelV2.isAnalyticalDashboard(content)) {
        return convertDashboardV2(analyticalDashboard, filterContext);
    }

    invariant(false, "Unknown analytical dashboard version");
}

export function convertFilterContextFromBackend(
    filterContext: JsonApiFilterContextOutDocument,
): IFilterContext {
    const content = filterContext.data.attributes!.content;

    if (AnalyticalDashboardModelV1.isFilterContext(content)) {
        return convertFilterContextFromBackendV1(filterContext);
    }

    if (AnalyticalDashboardModelV2.isFilterContext(content)) {
        return convertFilterContextFromBackendV2(filterContext);
    }

    invariant(false, "Unknown filter context version");
}

function convertFilterContextFilters(
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

export function getFilterContextFromIncluded(
    included: JsonApiAnalyticalDashboardOutDocument["included"],
): IFilterContext | undefined {
    const filterContext = included?.find(isFilterContextData) as JsonApiFilterContextOutWithLinks;
    if (!filterContext) {
        return;
    }

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
