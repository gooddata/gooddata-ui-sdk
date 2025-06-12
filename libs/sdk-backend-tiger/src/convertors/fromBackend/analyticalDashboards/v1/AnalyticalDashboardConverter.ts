// (C) 2020-2025 GoodData Corporation
import {
    AnalyticalDashboardModelV1,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiFilterContextOutDocument,
    isDataSetItem,
} from "@gooddata/api-client-tiger";
import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import { v4 as uuidv4 } from "uuid";
import {
    idRef,
    ObjectType,
    FilterContextItem,
    IFilterContext,
    IInsightWidget,
    IDashboardLayout,
    IDashboardWidget,
    IDashboard,
    IDashboardDateFilterConfig,
} from "@gooddata/sdk-model";
import updateWith from "lodash/updateWith.js";
import { fixWidgetLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIds } from "../../IdSanitization.js";
import { isInheritedObject } from "../../ObjectInheritance.js";
import { getShareStatus, stripQueryParams } from "../../utils.js";
import { sanitizeSelectionMode } from "../common/singleSelectionFilter.js";
import { convertUserIdentifier } from "../../UsersConverter.js";
import { convertLayout } from "../../../shared/layoutConverter.js";
import { convertDataSetItem } from "../../DataSetConverter.js";

function setWidgetRefsInLayout(layout: IDashboardLayout<IDashboardWidget> | undefined) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((layout, widgetPath) => {
        return updateWith(layout, widgetPath, (widget: IInsightWidget) => {
            const id = widget.localIdentifier ?? uuidv4();

            const convertedWidget: IInsightWidget = {
                ...widget,
                ref: idRef(id),
                uri: id,
                identifier: id,
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
        layout: convertLayout(
            true,
            setWidgetRefsInLayout(cloneWithSanitizedIds(analyticalDashboard.analyticalDashboard.layout)),
        ),
    };
}

export function convertDashboard(
    analyticalDashboard: JsonApiAnalyticalDashboardOutDocument,
    filterContext?: IFilterContext,
): IDashboard {
    const { data, links, included } = analyticalDashboard;
    const { id, attributes, meta = {}, relationships = {} } = data;
    const { createdBy, modifiedBy } = relationships;
    const { title = "", description = "", content, createdAt = "", modifiedAt = "" } = attributes;
    const isPrivate = meta.accessInfo?.private ?? false;

    const { dateFilterConfig, layout } = getConvertedAnalyticalDashboardContent(
        content as AnalyticalDashboardModelV1.IAnalyticalDashboard,
    );

    return {
        type: "IDashboard",
        ref: idRef(id, "analyticalDashboard"),
        identifier: id,
        uri: stripQueryParams(links!.self),
        title,
        description,
        created: createdAt,
        createdBy: convertUserIdentifier(createdBy, included),
        updated: modifiedAt,
        updatedBy: convertUserIdentifier(modifiedBy, included),
        // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
        isLocked: isInheritedObject(data),
        shareStatus: getShareStatus(isPrivate),
        isUnderStrictControl: true,
        tags: attributes.tags,
        filterContext,
        dateFilterConfig,
        layout,
        dataSets: included?.filter(isDataSetItem).map(convertDataSetItem) ?? [],
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
    return sanitizeSelectionMode(cloneWithSanitizedIds(content.filterContext.filters));
}
