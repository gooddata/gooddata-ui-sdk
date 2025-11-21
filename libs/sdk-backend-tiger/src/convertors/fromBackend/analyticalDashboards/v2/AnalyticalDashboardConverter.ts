// (C) 2020-2025 GoodData Corporation

import { updateWith } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

import {
    AnalyticalDashboardModelV2,
    JsonApiAnalyticalDashboardOutDocument,
    JsonApiAnalyticalDashboardOutIncludes,
    JsonApiDashboardPluginOutDocument,
    JsonApiDashboardPluginOutWithLinks,
    JsonApiFilterContextOutDocument,
    JsonApiFilterContextOutWithLinks,
    isDataSetItem,
    isFilterContextData,
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
    IDashboardTab,
    IDashboardWidget,
    IFilterContext,
    IInsightWidget,
    IRichTextWidget,
    IVisualizationSwitcherWidget,
    IdentifierRef,
    ObjectType,
    areObjRefsEqual,
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
    sectionHeadersDateDataSet?: IdentifierRef;
    tabs?: IDashboardTab[];
    activeTabLocalIdentifier?: string;
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

function getTabFilterContext(
    tab: AnalyticalDashboardModelV2.IDashboardTab,
    filterContextsList: IFilterContext[],
): IFilterContext | undefined {
    const sanitizedTabFilterRef = cloneWithSanitizedIds(tab.filterContextRef);
    return filterContextsList.find((fc) => areObjRefsEqual(fc.ref, sanitizedTabFilterRef));
}

function convertDashboardTabContent(
    tab: AnalyticalDashboardModelV2.IDashboardTab,
    filterContext?: IFilterContext,
): IDashboardTab {
    return {
        localIdentifier: tab.localIdentifier,
        title: tab.title,
        layout: convertLayout(
            true,
            prepareDrillLocalIdentifierIfMissing(setWidgetRefsInLayout(cloneWithSanitizedIds(tab.layout))),
        ),
        filterContext: filterContext || {
            ref: cloneWithSanitizedIds(tab.filterContextRef)!,
            identifier: "",
            uri: "",
            title: "",
            description: "",
            filters: [],
        },
        dateFilterConfig: cloneWithSanitizedIds(tab.dateFilterConfig),
        dateFilterConfigs: cloneWithSanitizedIds(tab.dateFilterConfigs),
        attributeFilterConfigs: cloneWithSanitizedIds(tab.attributeFilterConfigs),
    };
}

function convertDashboardTab(
    tab: AnalyticalDashboardModelV2.IDashboardTab,
    filterContextsList: IFilterContext[],
): IDashboardTab {
    const filterContext = getTabFilterContext(tab, filterContextsList);
    return {
        ...convertDashboardTabContent(tab, filterContext),
    };
}

function getConvertedAnalyticalDashboardContent(
    analyticalDashboard: AnalyticalDashboardModelV2.IAnalyticalDashboard,
    included?: JsonApiAnalyticalDashboardOutIncludes[],
): IAnalyticalDashboardContent {
    const filterContextsList: IFilterContext[] = [];
    if (included) {
        const filterContexts = included.filter(isFilterContextData) as JsonApiFilterContextOutWithLinks[];
        filterContexts.forEach((fc) => {
            const { id, type, attributes } = fc;
            const { title = "", description = "", content } = attributes!;
            const filters = convertFilterContextFilters(content as AnalyticalDashboardModelV2.IFilterContext);
            filterContextsList.push({
                ref: idRef(id, type),
                identifier: id,
                uri: fc.links!.self,
                title,
                description,
                filters,
            });
        });
    }

    const tabs = analyticalDashboard.tabs?.map((tab) => {
        return convertDashboardTab(tab, filterContextsList);
    });

    const activeTab =
        tabs?.find((tab) => tab.localIdentifier === analyticalDashboard.activeTabLocalIdentifier) ??
        tabs?.[0];

    const layout = convertLayout(
        true,
        prepareDrillLocalIdentifierIfMissing(
            setWidgetRefsInLayout(cloneWithSanitizedIds(analyticalDashboard.layout)),
        ),
    );

    return {
        dateFilterConfig: analyticalDashboard.dateFilterConfig
            ? cloneWithSanitizedIds(analyticalDashboard.dateFilterConfig)
            : activeTab?.dateFilterConfig,
        dateFilterConfigs: analyticalDashboard.dateFilterConfigs
            ? cloneWithSanitizedIds(analyticalDashboard.dateFilterConfigs)
            : activeTab?.dateFilterConfigs,
        attributeFilterConfigs: analyticalDashboard.attributeFilterConfigs
            ? cloneWithSanitizedIds(analyticalDashboard.attributeFilterConfigs)
            : activeTab?.attributeFilterConfigs,
        layout: layout ?? activeTab?.layout,
        plugins: analyticalDashboard.plugins?.map(convertDashboardPluginLink),
        disableCrossFiltering: analyticalDashboard.disableCrossFiltering,
        disableUserFilterReset: analyticalDashboard.disableUserFilterReset,
        disableUserFilterSave: analyticalDashboard.disableUserFilterSave,
        disableFilterViews: analyticalDashboard.disableFilterViews,
        evaluationFrequency: analyticalDashboard.evaluationFrequency,
        sectionHeadersDateDataSet: cloneWithSanitizedIds(analyticalDashboard.sectionHeadersDateDataSet),
        tabs,
        activeTabLocalIdentifier: analyticalDashboard.activeTabLocalIdentifier,
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
        sectionHeadersDateDataSet,
        tabs,
        activeTabLocalIdentifier,
    } = getConvertedAnalyticalDashboardContent(
        content as AnalyticalDashboardModelV2.IAnalyticalDashboard,
        included,
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
        sectionHeadersDateDataSet,
        tabs,
        activeTabLocalIdentifier,
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

export function convertFilterViewContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContextWithTab,
): FilterContextItem[] {
    return sanitizeSelectionMode(cloneWithSanitizedIds(content.filters));
}

export function convertDashboardPlugin({
    data,
    links,
    included,
}: JsonApiDashboardPluginOutDocument): IDashboardPlugin {
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
