// (C) 2020 GoodData Corporation
import {
    AnalyticalDashboard,
    AnalyticalDashboardAttributes,
    AnalyticalDashboardObjectModel,
    AnalyticalDashboardCollection,
    AnalyticalDashboardsItem,
    FilterContext,
    FilterContextDataRequest,
    IncludedResource,
    isFilterContextData,
} from "@gooddata/api-client-tiger";
import { IDashboard, IFilterContext, IListedDashboard } from "@gooddata/sdk-backend-spi";

import { idRef, ObjectType } from "@gooddata/sdk-model";
import omit from "lodash/omit";
import { cloneWithSanitizedIds } from "./IdSanitization";

export const convertAnalyticalDashboard = (
    analyticalDashboard: AnalyticalDashboardsItem,
): IListedDashboard => {
    const attributes = analyticalDashboard.attributes as AnalyticalDashboardAttributes;
    const { title, description } = attributes;
    return {
        ref: idRef(analyticalDashboard.id, "analyticalDashboard"),
        uri: analyticalDashboard.links!.self,
        identifier: analyticalDashboard.id,
        title: title ?? "",
        description: description ?? "",
        created: "",
        updated: "",
    };
};

export const convertAnalyticalDashboardToListItems = (
    analyticalDashboards: AnalyticalDashboardCollection,
): IListedDashboard[] => {
    return analyticalDashboards.data.map(convertAnalyticalDashboard);
};

export function convertAnalyticalDashboardContent(
    analyticalDashboard: AnalyticalDashboardObjectModel.IAnalyticalDashboard["analyticalDashboard"],
): AnalyticalDashboardObjectModel.IAnalyticalDashboard["analyticalDashboard"] {
    return {
        isLocked: analyticalDashboard.isLocked,
        tags: analyticalDashboard.tags,
        dateFilterConfig: cloneWithSanitizedIds(analyticalDashboard.dateFilterConfig),
        filterContextRef: cloneWithSanitizedIds(analyticalDashboard.filterContextRef),
        layout: cloneWithSanitizedIds(analyticalDashboard.layout),
    };
}

export function convertDashboard(
    analyticalDashboard: AnalyticalDashboard,
    filterContext?: IFilterContext,
): IDashboard {
    const { id, attributes = {} } = analyticalDashboard.data;
    const { title = "", description = "", content } = attributes;

    const dashboardData = convertAnalyticalDashboardContent(
        (content as AnalyticalDashboardObjectModel.IAnalyticalDashboard).analyticalDashboard,
    );

    return {
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        uri: (analyticalDashboard.links as any).self,
        title,
        description,
        created: "",
        updated: "",
        filterContext,
        ...omit(dashboardData, ["filterContextRef"]),
    };
}

export function convertFilterContextFromBackend(filterContext: FilterContext): IFilterContext {
    const { id, type, attributes } = filterContext.data;
    const { title = "", description = "", content } = attributes!;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: (filterContext.links as any).self,
        title,
        description,
        filters: cloneWithSanitizedIds(
            (content as AnalyticalDashboardObjectModel.IFilterContext).filterContext.filters,
        ),
    };
}

export function getFilterContextFromIncluded(included: IncludedResource[]): IFilterContext | undefined {
    const filterContextData = included.find(isFilterContextData);
    if (!filterContextData) {
        return;
    }

    const { id, type, attributes } = filterContextData as FilterContextDataRequest;
    const { title = "", description = "", content } = attributes!;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: "", // FIXME we need link in included
        title,
        description,
        filters: cloneWithSanitizedIds(
            (content as AnalyticalDashboardObjectModel.IFilterContext).filterContext.filters,
        ),
    };
}
