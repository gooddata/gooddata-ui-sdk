// (C) 2020-2026 GoodData Corporation

import { updateWith } from "lodash-es";
import { v4 as uuidv4 } from "uuid";

import {
    type AnalyticalDashboardModelV2,
    type ITigerDashboardAttributeFilterConfig,
    type ITigerDashboardDateFilterConfig,
    type ITigerDashboardLayout,
    type ITigerFilterContextItem,
    type JsonApiAnalyticalDashboardOutDocument,
    type JsonApiAnalyticalDashboardOutIncludes,
    type JsonApiDashboardPluginOutDocument,
    type JsonApiDashboardPluginOutWithLinks,
    type JsonApiFilterContextOutDocument,
    isDataSetItem,
} from "@gooddata/api-client-tiger";
import { type LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IDashboard,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardLayout,
    type IDashboardLayoutWidget,
    type IDashboardPlugin,
    type IDashboardPluginLink,
    type IDashboardTab,
    type IDashboardWidget,
    type IFilterContext,
    type IInsightWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type IdentifierRef,
    type ObjectType,
    areObjRefsEqual,
    idRef,
    isDashboardLayout,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";

import { convertFilterContextFilters } from "./FilterContextFiltersConverter.js";
import { convertLayout } from "../../../shared/layoutConverter.js";
import { convertDataSetItem } from "../../DataSetConverter.js";
import { fixWidgetLegacyElementUris } from "../../fixLegacyElementUris.js";
import { cloneWithSanitizedIds, cloneWithSanitizedIdsTyped } from "../../IdSanitization.js";
import { isInheritedObject } from "../../ObjectInheritance.js";
import { convertUserIdentifier } from "../../UsersConverter.js";
import { getShareStatus, stripQueryParams } from "../../utils.js";
import { getFilterContextsFromIncluded } from "../common/filterContextUtils.js";
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
            prepareDrillLocalIdentifierIfMissing(
                setWidgetRefsInLayout(
                    cloneWithSanitizedIdsTyped<ITigerDashboardLayout, IDashboardLayout>(tab.layout),
                ),
            ),
        ),
        filterContext: filterContext || {
            ref: cloneWithSanitizedIds(tab.filterContextRef)!,
            identifier: "",
            uri: "",
            title: "",
            description: "",
            filters: [],
        },
        dateFilterConfig: cloneWithSanitizedIdsTyped<
            ITigerDashboardDateFilterConfig | undefined,
            IDashboardDateFilterConfig | undefined
        >(tab.dateFilterConfig),
        dateFilterConfigs: cloneWithSanitizedIds(tab.dateFilterConfigs),
        attributeFilterConfigs: cloneWithSanitizedIdsTyped<
            ITigerDashboardAttributeFilterConfig[] | undefined,
            IDashboardAttributeFilterConfig[] | undefined
        >(tab.attributeFilterConfigs),
        filterGroupsConfig: cloneWithSanitizedIds(tab.filterGroupsConfig),
    };
}

function convertDashboardTab(
    tab: AnalyticalDashboardModelV2.IDashboardTab,
    filterContextsList: IFilterContext[],
    filterContextOverride?: IFilterContext,
): IDashboardTab {
    // Provided filter context override is used for all tabs - it is used for export and export is done for single tab only
    const filterContext = filterContextOverride || getTabFilterContext(tab, filterContextsList);
    return {
        ...convertDashboardTabContent(tab, filterContext),
    };
}

function getConvertedAnalyticalDashboardContent(
    analyticalDashboard: AnalyticalDashboardModelV2.IAnalyticalDashboard,
    filterContextsList: IFilterContext[],
    filterContextOverride?: IFilterContext,
): IAnalyticalDashboardContent {
    const tabs = analyticalDashboard.tabs?.map((tab) => {
        return convertDashboardTab(tab, filterContextsList, filterContextOverride);
    });

    const defaultTab = tabs?.[0];

    const layout = convertLayout(
        true,
        prepareDrillLocalIdentifierIfMissing(
            setWidgetRefsInLayout(
                cloneWithSanitizedIdsTyped<ITigerDashboardLayout | undefined, IDashboardLayout | undefined>(
                    analyticalDashboard.layout,
                ),
            ),
        ),
    );

    return {
        dateFilterConfig: analyticalDashboard.dateFilterConfig
            ? cloneWithSanitizedIdsTyped<ITigerDashboardDateFilterConfig, IDashboardDateFilterConfig>(
                  analyticalDashboard.dateFilterConfig,
              )
            : defaultTab?.dateFilterConfig,
        dateFilterConfigs: analyticalDashboard.dateFilterConfigs
            ? cloneWithSanitizedIds(analyticalDashboard.dateFilterConfigs)
            : defaultTab?.dateFilterConfigs,
        attributeFilterConfigs: analyticalDashboard.attributeFilterConfigs
            ? cloneWithSanitizedIdsTyped<
                  ITigerDashboardAttributeFilterConfig[],
                  IDashboardAttributeFilterConfig[]
              >(analyticalDashboard.attributeFilterConfigs)
            : defaultTab?.attributeFilterConfigs,
        layout: layout ?? defaultTab?.layout,
        plugins: analyticalDashboard.plugins?.map(convertDashboardPluginLink),
        disableCrossFiltering: analyticalDashboard.disableCrossFiltering,
        disableUserFilterReset: analyticalDashboard.disableUserFilterReset,
        disableUserFilterSave: analyticalDashboard.disableUserFilterSave,
        disableFilterViews: analyticalDashboard.disableFilterViews,
        evaluationFrequency: analyticalDashboard.evaluationFrequency,
        sectionHeadersDateDataSet: cloneWithSanitizedIds(analyticalDashboard.sectionHeadersDateDataSet),
        tabs,
    };
}

function getDashboardRootFilterContext(
    analyticalDashboardContent: AnalyticalDashboardModelV2.IAnalyticalDashboard,
    filterContextsList: IFilterContext[],
): IFilterContext | undefined {
    const sanitizedFilterRef = cloneWithSanitizedIds(analyticalDashboardContent.filterContextRef);

    return filterContextsList.find((fc) => areObjRefsEqual(fc.ref, sanitizedFilterRef));
}

/**
 * Converts Tiger-specific analytical dashboard to platform-agnostic dashboard.
 *
 * @param analyticalDashboard - JSON API document containing Tiger dashboard (uses ITigerDashboardLayout, ITigerDashboardTab, etc.)
 * @param filterContext - Optional external filter context override
 * @returns Platform-agnostic dashboard (uses IDashboardLayout, IDashboardTab, etc.)
 */
export function convertDashboard(
    analyticalDashboard: JsonApiAnalyticalDashboardOutDocument,
    filterContext?: IFilterContext, // external override
): IDashboard {
    const { data, links, included } = analyticalDashboard;
    const { id, attributes, meta = {}, relationships = {} } = data;
    const { createdBy, modifiedBy } = relationships;
    const { title = "", description = "", content, createdAt = "", modifiedAt = "" } = attributes;
    const isPrivate = meta.accessInfo?.private ?? false;

    let filterContextsList: IFilterContext[] = [];
    if (included) {
        filterContextsList = getFilterContextsFromIncluded(included);
    }

    const defaultFilterContext = getDashboardRootFilterContext(
        content as AnalyticalDashboardModelV2.IAnalyticalDashboard,
        filterContextsList,
    );

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
    } = getConvertedAnalyticalDashboardContent(
        content as AnalyticalDashboardModelV2.IAnalyticalDashboard,
        filterContextsList,
        filterContext,
    );

    const filterContextOfDefaultTab = tabs?.[0]?.filterContext;

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
        filterContext: filterContext ?? filterContextOfDefaultTab ?? defaultFilterContext,
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
        dataSets: included?.filter(isDataSetItem).map((dataSet) => convertDataSetItem(dataSet)) ?? [],
    };
}

/**
 * Converts Tiger-specific filter context to platform-agnostic filter context.
 *
 * @param filterContext - JSON API document containing Tiger filter context (uses ITigerFilterContextItem[])
 * @returns Platform-agnostic filter context (uses FilterContextItem[])
 */
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
        filters: convertFilterContextFilters(content as AnalyticalDashboardModelV2.IFilterContext),
    };
}

export function convertFilterViewContextFilters(
    content: AnalyticalDashboardModelV2.IFilterContextWithTab,
): FilterContextItem[] {
    return sanitizeSelectionMode(
        cloneWithSanitizedIdsTyped<ITigerFilterContextItem[], FilterContextItem[]>(content.filters),
    );
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
