// (C) 2020-2021 GoodData Corporation
import {
    AnalyticalDashboardModelV2,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiFilterContextOutDocument,
} from "@gooddata/api-client-tiger";
import {
    FilterContextItem,
    IDashboard,
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IDashboardWidget,
    IFilterContext,
    LayoutPath,
    walkLayout,
    IInsightWidget,
} from "@gooddata/sdk-backend-spi";

import { IdentifierRef, idRef, ObjectType } from "@gooddata/sdk-model";
import updateWith from "lodash/updateWith";
import { cloneWithSanitizedIds } from "../../IdSanitization";
import { isInheritedObject } from "../../utils";
import { fixWidgetLegacyElementUris } from "../../fixLegacyElementUris";

function setWidgetRefsInLayout(layout: IDashboardLayout<IDashboardWidget> | undefined) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((layout, widgetPath, index) => {
        return updateWith(layout, widgetPath, (widget: IInsightWidget) => {
            const temporaryWidgetId = (widget.insight as IdentifierRef).identifier + "_widget-" + index;

            const convertedWidget: IInsightWidget = {
                ...widget,
                ref: idRef(temporaryWidgetId),
                uri: temporaryWidgetId,
                identifier: temporaryWidgetId,
            };

            return fixWidgetLegacyElementUris(convertedWidget);
        });
    }, layout);
}

interface IAnalyticalDashboardContent {
    layout?: IDashboardLayout;
    dateFilterConfig?: IDashboardDateFilterConfig;
}

function getConvertedAnalyticalDashboardContent(
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
        content as AnalyticalDashboardModelV2.IAnalyticalDashboard,
    );

    return {
        type: "IDashboard",
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        uri: analyticalDashboard.links!.self,
        title,
        description,
        created: "",
        updated: "",
        // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
        isLocked: isInheritedObject(id),
        tags: attributes.tags ?? [],
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
        filters: convertFilterContextFilters(content as AnalyticalDashboardModelV2.IFilterContext),
    };
}

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    return cloneWithSanitizedIds(content.filters);
}
