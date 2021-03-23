// (C) 2020-2021 GoodData Corporation
import invariant from "ts-invariant";
import {
    AnalyticalDashboardModelV1,
    AnalyticalDashboardModelV2,
    isFilterContextData,
    JsonApiAnalyticalDashboardInAttributes,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiAnalyticalDashboardOutList,
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiFilterContextOutDocument,
    JsonApiFilterContextOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    DashboardWidget,
    FilterContextItem,
    IDashboard,
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IFilterContext,
    IListedDashboard,
    LayoutPath,
    walkLayout,
} from "@gooddata/sdk-backend-spi";

import { IdentifierRef, idRef, ObjectType } from "@gooddata/sdk-model";
import updateWith from "lodash/updateWith";
import { cloneWithSanitizedIds } from "./IdSanitization";
import { isInheritedObject } from "./utils";

export const convertAnalyticalDashboard = (
    analyticalDashboard: JsonApiAnalyticalDashboardOutWithLinks,
): IListedDashboard => {
    const attributes = analyticalDashboard.attributes as JsonApiAnalyticalDashboardInAttributes;
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
    analyticalDashboards: JsonApiAnalyticalDashboardOutList,
): IListedDashboard[] => {
    return analyticalDashboards.data.map(convertAnalyticalDashboard);
};

function setWidgetRefsInLayout(layout: IDashboardLayout<DashboardWidget> | undefined) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((layout, widgetPath, index) => {
        return updateWith(layout, widgetPath, (widget) => ({
            ...widget,
            ref: idRef((widget.insight as IdentifierRef).identifier + "_widget-" + index),
        }));
    }, layout);
}

interface IAnalyticalDashboardContent {
    layout?: IDashboardLayout;
    dateFilterConfig?: IDashboardDateFilterConfig;
}

function getConvertedAnalyticalDashboardContent(
    analyticalDashboard:
        | AnalyticalDashboardModelV1.IAnalyticalDashboard
        | AnalyticalDashboardModelV2.IAnalyticalDashboard,
): IAnalyticalDashboardContent {
    if (AnalyticalDashboardModelV1.isAnalyticalDashboard(analyticalDashboard)) {
        return getConvertedAnalyticalDashboardContentV1(analyticalDashboard);
    }

    if (AnalyticalDashboardModelV2.isAnalyticalDashboard(analyticalDashboard)) {
        return getConvertedAnalyticalDashboardContentV2(analyticalDashboard);
    }

    invariant(false, "Unknown analytical dashboard version");
}

function getConvertedAnalyticalDashboardContentV1(
    analyticalDashboard: AnalyticalDashboardModelV1.IAnalyticalDashboard,
): IAnalyticalDashboardContent {
    return {
        dateFilterConfig: cloneWithSanitizedIds(analyticalDashboard.analyticalDashboard.dateFilterConfig),
        layout: setWidgetRefsInLayout(cloneWithSanitizedIds(analyticalDashboard.analyticalDashboard.layout)),
    };
}

function getConvertedAnalyticalDashboardContentV2(
    analyticalDashboard: AnalyticalDashboardModelV2.IAnalyticalDashboard,
): IAnalyticalDashboardContent {
    return {
        dateFilterConfig: cloneWithSanitizedIds(analyticalDashboard.dateFilterConfig),
        layout: setWidgetRefsInLayout(cloneWithSanitizedIds(analyticalDashboard.layout)),
    };
}

export function convertDashboard(
    analyticalDashboard: JsonApiAnalyticalDashboardOutDocument,
    filterContext?: IFilterContext,
): IDashboard {
    const { id, attributes = {} } = analyticalDashboard.data;
    const { title = "", description = "", content } = attributes;

    const { dateFilterConfig, layout } = getConvertedAnalyticalDashboardContent(
        content as
            | AnalyticalDashboardModelV1.IAnalyticalDashboard
            | AnalyticalDashboardModelV2.IAnalyticalDashboard,
    );

    return {
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        uri: analyticalDashboard.links!.self,
        title,
        description,
        created: "",
        updated: "",
        // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
        isLocked: isInheritedObject(id),
        tags: attributes.tags,
        filterContext,
        dateFilterConfig,
        layout,
    };
}

export function convertFilterContextFromBackend(
    filterContext: JsonApiFilterContextOutDocument,
): IFilterContext {
    const { id, type, attributes } = filterContext.data;
    const { title = "", description = "", content } = attributes!;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: filterContext.links!.self,
        title,
        description,
        filters: convertedFilterContextFilters(
            content as AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
        ),
    };
}

function convertedFilterContextFilters(
    content: AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    if (AnalyticalDashboardModelV1.isFilterContext(content)) {
        return convertedFilterContextFiltersV1(content);
    }

    if (AnalyticalDashboardModelV2.isFilterContext(content)) {
        return convertedFilterContextFiltersV2(content);
    }

    invariant(false, "Unknown filter context version");
}

function convertedFilterContextFiltersV1(
    content: AnalyticalDashboardModelV1.IFilterContext,
): FilterContextItem[] {
    return cloneWithSanitizedIds(content.filterContext.filters);
}

function convertedFilterContextFiltersV2(
    content: AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    return cloneWithSanitizedIds(content.filters);
}

export function getFilterContextFromIncluded(included: any[]): IFilterContext | undefined {
    const filterContext = included.find(isFilterContextData) as JsonApiFilterContextOutWithLinks;
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
        filters: convertedFilterContextFilters(
            content as AnalyticalDashboardModelV1.IFilterContext | AnalyticalDashboardModelV2.IFilterContext,
        ),
    };
}
