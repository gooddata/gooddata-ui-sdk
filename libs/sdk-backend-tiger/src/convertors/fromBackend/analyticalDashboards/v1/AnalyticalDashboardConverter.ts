// (C) 2020-2021 GoodData Corporation
import {
    AnalyticalDashboardModelV1,
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
    IInsightWidget,
    LayoutPath,
    walkLayout,
} from "@gooddata/sdk-backend-spi";
import { IdentifierRef, idRef, ObjectType } from "@gooddata/sdk-model";
import updateWith from "lodash/updateWith";
import { fixWidgetLegacyElementUris } from "../../fixLegacyElementUris";
import { cloneWithSanitizedIds } from "../../IdSanitization";
import { isInheritedObject } from "../../utils";

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
    analyticalDashboard: AnalyticalDashboardModelV1.IAnalyticalDashboard,
): IAnalyticalDashboardContent {
    return {
        dateFilterConfig: cloneWithSanitizedIds(analyticalDashboard.analyticalDashboard.dateFilterConfig),
        layout: setWidgetRefsInLayout(cloneWithSanitizedIds(analyticalDashboard.analyticalDashboard.layout)),
    };
}

export function convertDashboard(
    analyticalDashboard: JsonApiAnalyticalDashboardOutDocument,
    filterContext?: IFilterContext,
): IDashboard {
    const { id, attributes = {} } = analyticalDashboard.data;
    const { title = "", description = "", content } = attributes;

    const { dateFilterConfig, layout } = getConvertedAnalyticalDashboardContent(
        content as AnalyticalDashboardModelV1.IAnalyticalDashboard,
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
        isPrivate: false,
        isShared: false,
        isUnderStrictControl: true,
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
        filters: convertFilterContextFilters(content as AnalyticalDashboardModelV1.IFilterContext),
    };
}

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV1.IFilterContext,
): FilterContextItem[] {
    return cloneWithSanitizedIds(content.filterContext.filters);
}
