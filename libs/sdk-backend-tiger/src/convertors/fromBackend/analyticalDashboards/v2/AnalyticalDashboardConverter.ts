// (C) 2020-2025 GoodData Corporation
import updateWith from "lodash/updateWith.js";
import { v4 as uuidv4 } from "uuid";

import {
    AnalyticalDashboardModelV2,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiDashboardPluginOutDocument,
    JsonApiDashboardPluginOutWithLinks,
    JsonApiFilterContextOutDocument,
    isDataSetItem,
} from "@gooddata/api-client-tiger";
import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    FilterContextItem,
    IDashboard,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfig,
    IDashboardLayout,
    IDashboardLayoutWidget,
    IDashboardPlugin,
    IDashboardPluginLink,
    IDashboardWidget,
    IFilterContext,
    IInsightWidget,
    IRichTextWidget,
    IVisualizationSwitcherWidget,
    IdentifierRef,
    ObjectType,
    idRef,
    isDashboardLayout,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";

import { convertLayout } from "../../../shared/layoutConverter.js";
import { convertDataSetItem } from "../../DataSetConverter.js";
import { fixWidgetLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIds } from "../../IdSanitization.js";
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
        return updateWith(
            layout,
            widgetPath,
            (
                widget:
                    | IInsightWidget
                    | IRichTextWidget
                    | IVisualizationSwitcherWidget
                    | IDashboardLayoutWidget,
            ) => {
                const id = widget.localIdentifier ?? uuidv4();

                const convertedWidget:
                    | IInsightWidget
                    | IRichTextWidget
                    | IVisualizationSwitcherWidget
                    | IDashboardLayoutWidget = {
                    ...widget,
                    ref: idRef(id),
                    uri: id,
                    identifier: id,
                };

                if (isDashboardLayout(convertedWidget)) {
                    return convertedWidget;
                }

                const isSwitcher = isVisualizationSwitcherWidget(convertedWidget);

                return fixWidgetLegacyElementUris({
                    ...convertedWidget,
                    ...(isSwitcher
                        ? {
                              visualizations: convertedWidget.visualizations.map((visualization) => {
                                  const id = visualization.localIdentifier ?? uuidv4();
                                  return {
                                      ...visualization,
                                      ref: idRef(id),
                                      uri: id,
                                      identifier: id,
                                  };
                              }),
                          }
                        : {}),
                });
            },
        );
    }, layout);
}

interface IDashboardDateFilterConfigItem {
    dateDataSet: IdentifierRef;
    config: IDashboardDateFilterConfig;
}
interface IAnalyticalDashboardContent {
    layout?: IDashboardLayout;
    dateFilterConfig?: IDashboardDateFilterConfig;
    dateFilterConfigs?: IDashboardDateFilterConfigItem[];
    plugins?: IDashboardPluginLink[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    disableCrossFiltering?: boolean;
    disableUserFilterReset?: boolean;
    disableUserFilterSave?: boolean;
    disableFilterViews?: boolean;
    evaluationFrequency?: string;
}

function convertDashboardPluginLink(
    pluginLink: AnalyticalDashboardModelV2.IDashboardPluginLink,
): IDashboardPluginLink {
    return {
        type: "IDashboardPluginLink",
        plugin: cloneWithSanitizedIds(pluginLink.plugin),
        parameters: pluginLink.parameters,
    };
}

function getConvertedAnalyticalDashboardContent(
    analyticalDashboard: AnalyticalDashboardModelV2.IAnalyticalDashboard,
): IAnalyticalDashboardContent {
    return {
        dateFilterConfig: cloneWithSanitizedIds(analyticalDashboard.dateFilterConfig),
        dateFilterConfigs: cloneWithSanitizedIds(analyticalDashboard.dateFilterConfigs),
        attributeFilterConfigs: cloneWithSanitizedIds(analyticalDashboard.attributeFilterConfigs),
        layout: convertLayout(
            true,
            prepareDrillLocalIdentifierIfMissing(
                setWidgetRefsInLayout(cloneWithSanitizedIds(analyticalDashboard.layout)),
            ),
        ),
        plugins: analyticalDashboard.plugins?.map(convertDashboardPluginLink),
        disableCrossFiltering: analyticalDashboard.disableCrossFiltering,
        disableUserFilterReset: analyticalDashboard.disableUserFilterReset,
        disableUserFilterSave: analyticalDashboard.disableUserFilterSave,
        disableFilterViews: analyticalDashboard.disableFilterViews,
        evaluationFrequency: analyticalDashboard.evaluationFrequency,
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

    const {
        dateFilterConfig,
        layout,
        plugins,
        attributeFilterConfigs,
        dateFilterConfigs,
        disableCrossFiltering,
        disableUserFilterReset,
        disableUserFilterSave,
        disableFilterViews,
        evaluationFrequency,
    } = getConvertedAnalyticalDashboardContent(content as AnalyticalDashboardModelV2.IAnalyticalDashboard);

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
        tags: attributes.tags ?? [],
        filterContext,
        dateFilterConfig,
        dateFilterConfigs,
        attributeFilterConfigs,
        layout,
        plugins,
        disableCrossFiltering,
        disableUserFilterReset,
        disableUserFilterSave,
        disableFilterViews,
        evaluationFrequency,
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
        filters: convertFilterContextFilters(content as AnalyticalDashboardModelV2.IFilterContext),
    };
}

export function convertFilterContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContext,
): FilterContextItem[] {
    return sanitizeSelectionMode(cloneWithSanitizedIds(content.filters));
}

export function convertDashboardPlugin(plugin: JsonApiDashboardPluginOutDocument): IDashboardPlugin {
    const { data, links, included } = plugin;
    const { id, type, attributes, relationships = {} } = data;
    const { createdBy, modifiedBy } = relationships;
    const { title = "", description = "", content, tags, createdAt = "", modifiedAt = "" } = attributes!;
    const { url } = content as AnalyticalDashboardModelV2.IDashboardPlugin;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: links!.self,
        name: title,
        description,
        tags: tags ?? [],
        type: "IDashboardPlugin",
        url,
        created: createdAt,
        createdBy: convertUserIdentifier(createdBy, included),
        updated: modifiedAt,
        updatedBy: convertUserIdentifier(modifiedBy, included),
    };
}

export function convertDashboardPluginWithLinks(
    plugin: JsonApiDashboardPluginOutWithLinks,
    included: JsonApiAnalyticalDashboardOutIncludes[] = [],
): IDashboardPlugin {
    const { id, type, attributes, relationships = {} } = plugin;
    const { createdBy, modifiedBy } = relationships;
    const { title = "", description = "", content, tags, createdAt, modifiedAt } = attributes!;
    const { url } = content as AnalyticalDashboardModelV2.IDashboardPlugin;

    return {
        ref: idRef(id, type as ObjectType),
        identifier: id,
        uri: plugin.links!.self,
        name: title,
        description,
        tags: tags ?? [],
        type: "IDashboardPlugin",
        url,
        created: createdAt,
        createdBy: convertUserIdentifier(createdBy, included),
        updated: modifiedAt,
        updatedBy: convertUserIdentifier(modifiedBy, included),
    };
}

export function prepareDrillLocalIdentifierIfMissing(layout?: IDashboardLayout) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((layout, widgetPath) => {
        return updateWith(layout, widgetPath, (widget: IInsightWidget) => {
            if (!widget?.drills) {
                return widget;
            }

            const drills = widget.drills.map((it) => ({
                ...it,
                localIdentifier: it.localIdentifier ?? uuidv4().replace(/-/g, ""),
            }));

            return {
                ...widget,
                drills,
            };
        });
    }, layout);
}
