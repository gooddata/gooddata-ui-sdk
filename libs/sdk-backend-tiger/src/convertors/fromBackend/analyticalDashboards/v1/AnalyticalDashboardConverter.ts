// (C) 2020-2026 GoodData Corporation

import { updateWith } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

import {
    type AnalyticalDashboardModelV1,
    type ITigerDashboardDateFilterConfig,
    type ITigerDashboardLayout,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiFilterContextOutDocument,
    isDataSetItem,
} from "@gooddata/api-client-tiger";
import { type LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboard,
    type IDashboardDateFilterConfig,
    type IDashboardLayout,
    type IDashboardWidget,
    type IFilterContext,
    type IInsightWidget,
    type ObjectType,
    idRef,
} from "@gooddata/sdk-model";

import { convertLayout } from "../../../shared/layoutConverter.js";
import { convertTigerToSdkFilters } from "../../../shared/storedFilterConverter.js";
import { convertDataSetItem } from "../../DataSetConverter.js";
import { fixWidgetLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIdsTyped } from "../../IdSanitization.js";
import { isInheritedObject } from "../../ObjectInheritance.js";
import { convertUserIdentifier } from "../../UsersConverter.js";
import { getShareStatus, stripQueryParams } from "../../utils.js";
import { sanitizeSelectionMode } from "../common/singleSelectionFilter.js";

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
        dateFilterConfig: cloneWithSanitizedIdsTyped<
            ITigerDashboardDateFilterConfig | undefined,
            IDashboardDateFilterConfig | undefined
        >(analyticalDashboard.analyticalDashboard.dateFilterConfig),
        layout: convertLayout(
            true,
            setWidgetRefsInLayout(
                cloneWithSanitizedIdsTyped<ITigerDashboardLayout | undefined, IDashboardLayout | undefined>(
                    analyticalDashboard.analyticalDashboard.layout,
                ),
            ),
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
        created: createdAt ?? "",
        createdBy: convertUserIdentifier(createdBy, included),
        updated: modifiedAt ?? "",
        updatedBy: convertUserIdentifier(modifiedBy, included),
        // TODO: TIGER-HACK: inherited objects must be locked; they are read-only for all
        isLocked: isInheritedObject(data),
        shareStatus: getShareStatus(isPrivate),
        isUnderStrictControl: true,
        tags: attributes.tags,
        filterContext,
        dateFilterConfig,
        layout,
        dataSets: included?.filter(isDataSetItem).map((dataSet) => convertDataSetItem(dataSet)) ?? [],
    };
}

export function convertFilterContextFromBackend(
    filterContext: JsonApiFilterContextOutDocument,
): IFilterContext {
    const { id, type, attributes } = filterContext.data;
    const { title = "", description = "", content } = attributes;

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
    return sanitizeSelectionMode(convertTigerToSdkFilters(content.filterContext.filters) ?? []);
}
