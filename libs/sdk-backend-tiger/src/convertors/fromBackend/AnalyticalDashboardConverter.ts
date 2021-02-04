// (C) 2020-2021 GoodData Corporation
import {
    JsonApiAnalyticalDashboardAttributes,
    JsonApiAnalyticalDashboardDocument,
    JsonApiAnalyticalDashboardList,
    JsonApiFilterContextDocument,
    AnalyticalDashboardObjectModel,
    isFilterContextData,
    JsonApiAnalyticalDashboardWithLinks,
    JsonApiFilterContextWithLinks,
} from "@gooddata/api-client-tiger";
import { IDashboard, IFilterContext, IListedDashboard } from "@gooddata/sdk-backend-spi";

import { idRef, ObjectType } from "@gooddata/sdk-model";
import omit from "lodash/omit";
import { cloneWithSanitizedIds } from "./IdSanitization";

export const convertAnalyticalDashboard = (
    analyticalDashboard: JsonApiAnalyticalDashboardWithLinks,
): IListedDashboard => {
    const attributes = analyticalDashboard.attributes as JsonApiAnalyticalDashboardAttributes;
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
    analyticalDashboards: JsonApiAnalyticalDashboardList,
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
    analyticalDashboard: JsonApiAnalyticalDashboardDocument,
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
        uri: analyticalDashboard.links!.self,
        title,
        description,
        created: "",
        updated: "",
        filterContext,
        ...omit(dashboardData, ["filterContextRef"]),
    };
}

export function convertFilterContextFromBackend(filterContext: JsonApiFilterContextDocument): IFilterContext {
    const { id, type, attributes } = filterContext.data;
    const { title = "", description = "", content } = attributes!;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: filterContext.links!.self,
        title,
        description,
        filters: cloneWithSanitizedIds(
            (content as AnalyticalDashboardObjectModel.IFilterContext).filterContext.filters,
        ),
    };
}

export function getFilterContextFromIncluded(included: any[]): IFilterContext | undefined {
    const filterContext = included.find(isFilterContextData) as JsonApiFilterContextWithLinks;
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
        filters: cloneWithSanitizedIds(
            (content as AnalyticalDashboardObjectModel.IFilterContext).filterContext.filters,
        ),
    };
}
