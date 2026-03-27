// (C) 2023-2026 GoodData Corporation

import { randomUUID } from "crypto";

import {
    type DeclarativeAnalyticalDashboard,
    type DeclarativeAnalyticalDashboardPermissionForAssignee,
    type DeclarativeAnalyticalDashboardPermissionForAssigneeRule,
    type DeclarativeFilterContext,
} from "@gooddata/api-client-tiger";
import type {
    ContainerWidget,
    Dashboard,
    DashboardAbsoluteDateFilter,
    DashboardAttributeFilter,
    DashboardFilters,
    DashboardRelativeDateFilter,
    IgnoredDrillDown,
    IgnoredDrillDownIntersection,
    Interaction,
    InteractionFilters,
    InteractionIncludedSourceMeasureFilters,
    InteractionOpenParamUrl,
    LocalDateFilter,
    RichTextWidget,
    Section,
    State,
    Visualisation,
    VisualisationWidget,
    VisualizationSwitcherWidget,
    Widget,
} from "@gooddata/sdk-code-schemas/v1";
import {
    type DashboardDateFilterConfigMode,
    type DrillOrigin,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardFilterGroup,
    type IDashboardFilterGroupsConfig,
    type IDashboardFilterReference,
    type IDashboardPluginLink,
    type IDrillDownIntersectionIgnoredAttributes,
    type IDrillDownReference,
    type IDrillToAttributeUrl,
    type IDrillToCustomUrl,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IFilterContextDefinition,
    type IInsightWidget,
    type IInsightWidgetDefinition,
    type InsightDrillDefinition,
} from "@gooddata/sdk-model";

import { VisualisationsTypes } from "../conts.js";
import { type OverrideDashboardDefinition } from "../from/declarativeDashboardToYaml.js";
import { type DashboardTab, type ExportEntities } from "../types.js";
import { parseUrlTarget } from "../utils/customUrl.js";
import { convertGranularity } from "../utils/granularityUtils.js";
import { toDeclarativePermissions } from "../utils/permissionUtils.js";
import { collectFieldLevelFilters, convertIdToTitle, getFullField } from "../utils/sharedUtils.js";
import {
    isAbsoluteDateFilter,
    isAttributeField,
    isAttributeFilter,
    isContainerWidget,
    isDashboardAbsoluteDateFilter,
    isDashboardAttributeFilter,
    isDashboardEmptyDateFilter,
    isDashboardNoopDateFilter,
    isDashboardRelativeDateFilter,
    isInsightWidget,
    isMetricValueFilter,
    isRankingFilter,
    isRelativeDateFilter,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
    parseReferenceObject,
} from "../utils/typeGuards.js";
import { createIdentifier, createLocalIdentifier } from "../utils/yamlUtils.js";

type DashboardDefinition = Pick<
    OverrideDashboardDefinition,
    | "layout"
    | "plugins"
    | "dateFilterConfig"
    | "dateFilterConfigs"
    | "disableCrossFiltering"
    | "disableUserFilterSave"
    | "disableUserFilterReset"
    | "disableFilterViews"
    | "attributeFilterConfigs"
    | "filterContextRef"
    | "tabs"
    | "activeTabLocalIdentifier"
> & {
    version: string;
};
type FilterContextDefinition = Pick<IFilterContextDefinition, "filters"> & {
    version: string;
};
type DashboardSection = Required<DashboardDefinition>["layout"]["sections"][number];
type DashboardWidget = DashboardSection["items"][number];
type EmptyValueHandling = NonNullable<IDashboardDateFilter["dateFilter"]["emptyValueHandling"]>;

function extractDashboardEmptyValueHandling(filter: unknown): EmptyValueHandling | undefined {
    const value = (filter as { empty_values?: unknown }).empty_values;
    if (value === "include" || value === "exclude" || value === "only") {
        return value;
    }
    return undefined;
}

function createFilterContextId(baseId: string): string {
    return `${baseId}_filterContext_${randomUUID()}`;
}

/**
 * Convert YAML tabs to Dashboard tabs with their own layouts and filter contexts.
 * Each tab maintains its own sections, filters, and filter configurations independently.
 * Filter contexts are created as separate entities referenced by filterContextRef.
 */
function yamlTabsToDeclarative(
    entities: ExportEntities,
    tabs: Array<{
        id: string;
        title: string;
        filters?: Dashboard["filters"];
        sections?: Section[];
    }>,
    enableSectionHeaders?: boolean,
): {
    tabs: DashboardTab[];
    filterContexts: DeclarativeFilterContext[];
} {
    const declarativeTabs: DashboardTab[] = [];
    const filterContexts: DeclarativeFilterContext[] = [];

    tabs.forEach((tab) => {
        // Convert tab sections to layout
        const layout = yamlLayoutToDeclarative(entities, tab.sections, enableSectionHeaders);

        // Process tab filters to get filter context and configs
        const {
            filterContext,
            dateFilterConfig,
            dateFilterConfigs,
            attributeFilterConfigs,
            filterGroupsConfig,
        } = yamlFilterContextToDeclarative(tab.id, tab.filters);

        // Store the filter context separately
        filterContexts.push(filterContext);

        // Create the tab structure with filterContextRef
        declarativeTabs.push({
            localIdentifier: tab.id,
            title: tab.title,
            layout,
            filterContextRef: createIdentifier<any>(filterContext.id, { forceType: "filterContext" }),
            dateFilterConfig,
            dateFilterConfigs,
            attributeFilterConfigs,
            ...(filterGroupsConfig ? { filterGroupsConfig } : {}),
        });
    });

    return {
        tabs: declarativeTabs,
        filterContexts,
    };
}

/**
 * Process dashboard with tabs - uses active tab or first tab as main dashboard for backwards compatibility
 */
function processDashboardWithTabs(entities: ExportEntities, input: Dashboard) {
    const tabsResult = yamlTabsToDeclarative(entities, input.tabs!, input.enable_section_headers);

    // Use first tab as default for backwards compatibility
    const defaultTabIndex = 0;

    const defaultTab = tabsResult.tabs[defaultTabIndex];
    return {
        layout: defaultTab.layout,
        filterContext: tabsResult.filterContexts[defaultTabIndex],
        dateFilterConfig: defaultTab.dateFilterConfig,
        dateFilterConfigs: defaultTab.dateFilterConfigs,
        attributeFilterConfigs: defaultTab.attributeFilterConfigs,
        tabs: tabsResult.tabs,
        tabFilterContexts: tabsResult.filterContexts,
    };
}

/**
 * Process traditional dashboard without tabs
 */
function processDashboardWithoutTabs(entities: ExportEntities, input: Dashboard) {
    const {
        filterContext,
        tabFilterContexts: _tabFilterContexts,
        ...rest
    } = processDashboardWithTabs(entities, {
        ...input,
        tabs: [
            {
                id: "defaultTabId",
                title: "",
                filters: input.filters,
                sections: input.sections ?? [],
            },
        ],
    });

    const dashboardFilterContextId = createFilterContextId(input.id);
    const dashboardFilterContext = {
        ...filterContext,
        id: dashboardFilterContextId,
    };

    return {
        ...rest,
        tabs: rest.tabs.map((tab) => ({
            ...tab,
            filterContextRef: createIdentifier<any>(dashboardFilterContextId, { forceType: "filterContext" }),
        })),
        filterContext: dashboardFilterContext,
        tabFilterContexts: [dashboardFilterContext],
    };
}

/** @public */
export function yamlDashboardToDeclarative(
    entities: ExportEntities,
    input: Dashboard,
): {
    dashboard: DeclarativeAnalyticalDashboard;
    filterContext: DeclarativeFilterContext;
    tabFilterContexts?: DeclarativeFilterContext[];
} {
    // Process dashboard based on whether it has tabs
    const {
        layout,
        filterContext,
        dateFilterConfig,
        dateFilterConfigs,
        attributeFilterConfigs,
        tabs,
        tabFilterContexts,
    } = input.tabs ? processDashboardWithTabs(entities, input) : processDashboardWithoutTabs(entities, input);

    const plugins = yamlPluginsToDeclarative(input.plugins);
    const [, permissions] = toDeclarativePermissions(input.permissions) as [
        Array<
            | DeclarativeAnalyticalDashboardPermissionForAssignee
            | DeclarativeAnalyticalDashboardPermissionForAssigneeRule
        >,
        [],
    ];

    const content: DashboardDefinition = {
        version: "2",
        layout,
        plugins,
        attributeFilterConfigs,
        dateFilterConfig,
        dateFilterConfigs,
        ...(tabs ? { tabs } : {}),
        ...(input.cross_filtering === false ? { disableCrossFiltering: true } : {}),
        ...(input.user_filters_save === false ? { disableUserFilterSave: true } : {}),
        ...(input.user_filters_reset === false ? { disableUserFilterReset: true } : {}),
        ...(input.filter_views === false ? { disableFilterViews: true } : {}),
        filterContextRef: createIdentifier<any>(filterContext.id, { forceType: "filterContext" }),
    };

    const dashboard = {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        tags: input.tags ?? [],
        description: input.description ?? "",
        content,
        permissions,
    };

    return {
        dashboard,
        filterContext,
        ...(tabFilterContexts && tabFilterContexts.length > 0 ? { tabFilterContexts } : {}),
    };
}

function yamlLayoutToDeclarative(
    entities: ExportEntities,
    sections: Section[] = [],
    enableSectionHeaders?: boolean,
): DashboardDefinition["layout"] {
    return {
        type: "IDashboardLayout",
        sections: sections.map((yamlSection) =>
            yamlSectionToDeclarative(entities, yamlSection, enableSectionHeaders),
        ),
        ...(enableSectionHeaders === undefined
            ? {}
            : {
                  configuration: {
                      sections: {
                          enableHeader: enableSectionHeaders,
                      },
                  },
              }),
    };
}

function yamlSectionToDeclarative(
    entities: ExportEntities,
    yamlSection: Section,
    enableSectionHeaders?: boolean,
): DashboardSection {
    return {
        type: "IDashboardLayoutSection",
        ...(yamlSection.title || yamlSection.description
            ? {
                  header: {
                      title: yamlSection.title ?? "",
                      description: yamlSection.description ?? "",
                  },
              }
            : {}),
        items: yamlSection.widgets
            .map((widget) => yamlWidgetItemToDeclarative(entities, widget, enableSectionHeaders))
            .filter(Boolean) as DashboardWidget[],
    };
}

export function yamlWidgetItemToDeclarative(
    entities: ExportEntities,
    input: Widget,
    enableSectionHeaders?: boolean,
): DashboardWidget | null {
    const size = yamlSizeToDeclarative(input);
    const widget = yamlWidgetToDeclarative(entities, input, enableSectionHeaders ?? true);

    if (!widget) {
        return null;
    }

    return {
        type: "IDashboardLayoutItem",
        size,
        widget,
    };
}

function yamlSizeToDeclarative(input: Widget) {
    return {
        xl: {
            gridWidth: input.columns ?? 12,
            gridHeight: input.rows ?? 22,
        },
    };
}

function yamlInsightWidgetToDeclarative(
    entities: ExportEntities,
    input: VisualisationWidget,
): IInsightWidgetDefinition {
    return {
        ...(input.id ? { localIdentifier: input.id } : {}),
        type: "insight",
        insight: createIdentifier<any>(input.visualization, { forceType: "visualizationObject" }),
        title: input.title || "",
        description: useInherit(input.description),
        configuration: {
            hideTitle: input.title === false,
            description: {
                includeMetrics: false,
                source:
                    input.description === "inherit" || input.description === undefined ? "insight" : "widget",
                visible: input.description !== false,
            },
        },
        ignoreDashboardFilters: (input.ignored_filters ?? [])
            .map((filterId) => yamlIgnoredFilterToDeclarative(filterId))
            .filter(Boolean) as IDashboardFilterReference[],
        ...(input.date
            ? {
                  dateDataSet: createIdentifier<any>(input.date, { forceType: "dataset" }),
              }
            : {}),
        properties: yamlWidgetPropertiesToDeclarative(input),
        drills: (input.interactions ?? [])
            .map((interaction) => yamlInteractionToDeclarative(entities, input.visualization, interaction))
            .filter(Boolean) as InsightDrillDefinition[],
        ignoredDrillDownHierarchies: (input.ignored_drill_downs ?? [])
            .map((hierarchy) => yamlIgnoredDrillDownToDeclarative(entities, input.visualization, hierarchy))
            .filter(Boolean) as IDrillDownReference[],
        drillDownIntersectionIgnoredAttributes: (input.ignored_drill_downs_intersections ?? [])
            .map((intersection) =>
                yamlIgnoredDrillDownsIntersectionsToDeclarative(entities, input.visualization, intersection),
            )
            .filter(Boolean) as IDrillDownIntersectionIgnoredAttributes[],
        ...(input.ignored_cross_filtering ? { ignoreCrossFiltering: true } : {}),
    };
}

export function yamlWidgetToDeclarative(
    entities: ExportEntities,
    input: VisualisationWidget | RichTextWidget | VisualizationSwitcherWidget | ContainerWidget,
    enableSectionHeaders?: boolean,
): DashboardWidget["widget"] {
    if (isContainerWidget(input)) {
        return {
            ...(input.container ? { localIdentifier: input.container } : {}),
            type: "IDashboardLayout",
            sections: input.sections.map((section) => ({
                type: "IDashboardLayoutSection",
                header: {
                    ...(enableSectionHeaders && section.title ? { title: section.title } : {}),
                    ...(enableSectionHeaders && section.description
                        ? { description: section.description }
                        : {}),
                },
                items: section.widgets
                    .map((widget) => yamlWidgetItemToDeclarative(entities, widget, enableSectionHeaders))
                    .filter(Boolean) as DashboardWidget[],
            })),
            configuration: {
                sections: {
                    enableHeader:
                        input.enable_section_headers === undefined
                            ? !!input.sections.some((s) => s.title || s.description)
                            : input.enable_section_headers,
                },
                ...(input.layout_direction ? { direction: input.layout_direction } : {}),
            },
        } as any;
    }
    if (isVisualizationSwitcherWidget(input)) {
        const visualizations = input.visualizations
            .map((vis) => yamlInsightWidgetToDeclarative(entities, vis) as IInsightWidget)
            .filter((vis) => vis !== null && vis !== undefined);
        return {
            ...(input.id ? { localIdentifier: input.id } : {}),
            type: "visualizationSwitcher",
            visualizations,
            description: "",
            title: "",
            drills: [],
            ignoreDashboardFilters: [],
        };
    }
    if (isRichTextWidget(input)) {
        return {
            ...(input.id ? { localIdentifier: input.id } : {}),
            type: "richText",
            content: input.content,
            description: "",
            title: "",
            drills: [],
            ignoreDashboardFilters: [],
        };
    }
    if (isInsightWidget(input)) {
        return yamlInsightWidgetToDeclarative(entities, input);
    }
    return undefined;
}

function yamlIgnoredDrillDownToDeclarative(
    entities: ExportEntities,
    visualization: string,
    hierarchy: IgnoredDrillDown,
): IDrillDownReference | null {
    const target = entities
        .filter((e) => VisualisationsTypes.includes(e.type))
        .find((e) => e.id === visualization)?.data as Visualisation;

    if (!target) {
        return null;
    }

    if (hierarchy.hierarchy) {
        return {
            type: "attributeHierarchyReference",
            attributeHierarchy: hierarchy.hierarchy as any,
            attribute: createIdentifier<any>(hierarchy.on),
        };
    }
    if (hierarchy.template) {
        return {
            type: "dateHierarchyReference",
            dateHierarchyTemplate: hierarchy.template as any,
            dateDatasetAttribute: createIdentifier<any>(hierarchy.on),
        };
    }

    return null;
}

function yamlIgnoredDrillDownsIntersectionsToDeclarative(
    entities: ExportEntities,
    visualization: string,
    intersection: IgnoredDrillDownIntersection,
): IDrillDownIntersectionIgnoredAttributes | null {
    if (!intersection.attributes || intersection.attributes.length === 0) {
        return null;
    }

    const drillDownReference = yamlIgnoredDrillDownToDeclarative(
        entities,
        visualization,
        intersection.hierarchy,
    );

    if (!drillDownReference) {
        return null;
    }

    return {
        ignoredAttributes: intersection.attributes.map((attribute) => attribute),
        drillDownReference,
    };
}

function yamlWidgetPropertiesToDeclarative(input: VisualisationWidget): any {
    const controls = {} as any;

    if (input.zoom_data) {
        controls.zoomInsight = true;
    }

    if (Object.keys(controls).length > 0) {
        return {
            controls,
        };
    }
    return {};
}

export function yamlInteractionToDeclarative(
    entities: ExportEntities,
    visualisation: string,
    input: Interaction,
): IDrillToInsight | IDrillToDashboard | IDrillToCustomUrl | IDrillToAttributeUrl | null {
    const target = entities
        .filter((e) => VisualisationsTypes.includes(e.type))
        .find((e) => e.id === visualisation)?.data as Visualisation;

    if (!target) {
        return null;
    }

    const field = target.query.fields[input.click_on as string] ?? null;
    if (!field) {
        return null;
    }

    const origin: DrillOrigin = isAttributeField(getFullField(field))
        ? {
              type: "drillFromAttribute",
              attribute: createLocalIdentifier(input.click_on as string),
          }
        : {
              type: "drillFromMeasure",
              measure: createLocalIdentifier(input.click_on as string),
          };

    const sourceMeasureFilters = collectFieldLevelFilters(target);
    const interactionFilters = yamlInteractionFiltersToDeclarative(
        input,
        target.query?.filter_by,
        sourceMeasureFilters,
    );
    const ignoredAttrs = (input.ignored_intersection_attributes as string[] | undefined)?.length
        ? { drillIntersectionIgnoredAttributes: input.ignored_intersection_attributes as string[] }
        : {};

    if (input.open_visualization) {
        const target = createIdentifier<any>((input.open_visualization ?? "") as string, {
            forceType: "visualizationObject",
        });
        return {
            type: "drillToInsight",
            transition: "pop-up",
            target,
            origin,
            ...interactionFilters.ignoredAttrs,
            ...interactionFilters.ignoredDashboardFilters,
            ...interactionFilters.includedSourceInsight,
            ...interactionFilters.includedSourceMeasure,
        } as IDrillToInsight;
    }
    if (input.open_dashboard) {
        const target = createIdentifier<any>((input.open_dashboard ?? "") as string, {
            forceType: "analyticalDashboard",
        });
        return {
            type: "drillToDashboard",
            transition: "in-place",
            target,
            origin,
            ...(input.open_dashboard_tab ? { targetTabLocalIdentifier: input.open_dashboard_tab } : {}),
            ...interactionFilters.ignoredAttrs,
            ...interactionFilters.ignoredDashboardFilters,
            ...interactionFilters.includedSourceInsight,
            ...interactionFilters.includedSourceMeasure,
        } as IDrillToDashboard;
    }
    if (input.open_url && typeof input.open_url === "string") {
        const url = parseUrlTarget(input.open_url as string) as any;
        return {
            type: "drillToCustomUrl",
            transition: "new-window",
            target: {
                url,
            },
            origin,
            ...ignoredAttrs,
        } as IDrillToCustomUrl;
    }
    if (input.open_url && typeof input.open_url === "object") {
        const url = input.open_url as InteractionOpenParamUrl;
        const displayForm = createIdentifier<any>((url["label"] ?? "") as string);
        const hyperlinkDisplayForm = createIdentifier<any>((url["href"] ?? "") as string);
        return {
            type: "drillToAttributeUrl",
            transition: "new-window",
            target: {
                displayForm,
                hyperlinkDisplayForm,
            },
            origin,
            ...ignoredAttrs,
        } as IDrillToAttributeUrl;
    }
    return null;
}

type LegacyInteractionFilterFields = {
    ignored_intersection_attributes?: string[];
    ignored_dashboard_filters?: string[];
    included_source_insight_filters?: string[];
    included_source_measure_filters?: InteractionIncludedSourceMeasureFilters;
};

type SourceVisualizationFilters = NonNullable<Visualisation["query"]>["filter_by"];

type InteractionExclude = NonNullable<InteractionFilters["exclude"]>;
type InteractionInclude = Omit<
    NonNullable<InteractionFilters["include"]>,
    "visualization_filters" | "metric_filters"
> & {
    visualization_filters?: string[];
    metric_filters?: string[];
};

function yamlInteractionFiltersToDeclarative(
    input: Interaction,
    sourceVisualizationFilters?: SourceVisualizationFilters,
    sourceMeasureFilters?: SourceVisualizationFilters,
) {
    const interaction = input as Interaction &
        LegacyInteractionFilterFields & {
            filters?: Omit<InteractionFilters, "exclude" | "include"> & {
                exclude?: InteractionExclude;
                include?: InteractionInclude;
            };
        };
    const excluded = interaction.filters?.exclude;
    const included = interaction.filters?.include;

    const ignoredAttrs = (excluded?.drilled_datapoint ?? interaction.ignored_intersection_attributes)?.length
        ? {
              drillIntersectionIgnoredAttributes: (excluded?.drilled_datapoint ??
                  interaction.ignored_intersection_attributes) as string[],
          }
        : {};
    const ignoredDashboardFilters = (excluded?.dashboard_filters ?? interaction.ignored_dashboard_filters)
        ?.length
        ? {
              ignoredDashboardFilters: (excluded?.dashboard_filters ??
                  interaction.ignored_dashboard_filters) as string[],
          }
        : {};
    const includedSourceInsight =
        included?.visualization_filters ?? interaction.included_source_insight_filters;
    const includedSourceMeasure = included?.metric_filters ?? interaction.included_source_measure_filters;

    return {
        ignoredAttrs,
        ignoredDashboardFilters,
        includedSourceInsight: includedSourceInsight
            ? {
                  includedSourceInsightFiltersObjRefs: yamlSourceFiltersToDeclarative(
                      includedSourceInsight,
                      sourceVisualizationFilters,
                  ),
              }
            : {},
        includedSourceMeasure: includedSourceMeasure
            ? {
                  includedSourceMeasureFiltersObjRefs: yamlSourceFiltersToDeclarative(
                      includedSourceMeasure,
                      sourceMeasureFilters,
                  ),
              }
            : {},
    };
}

function yamlSourceFiltersToDeclarative(
    input: string[],
    sourceVisualizationFilters?: SourceVisualizationFilters,
): any[] {
    return input
        .map((filterId) => sourceInsightFilterIdToDeclarative(filterId, sourceVisualizationFilters))
        .filter(Boolean);
}

function sourceInsightFilterIdToDeclarative(
    filterId: string,
    sourceVisualizationFilters?: SourceVisualizationFilters,
) {
    const filter = sourceVisualizationFilters?.[filterId];
    if (!filter) {
        return null;
    }

    if (isAttributeFilter(filter)) {
        return {
            type: "attributeFilter",
            label: createIdentifier<any>(filter.using),
        };
    }
    if (isAbsoluteDateFilter(filter) || isRelativeDateFilter(filter)) {
        return {
            type: "dateFilter",
            dataSet: createIdentifier<any>(filter.using, { forceType: "dataset" }),
        };
    }
    if (isMetricValueFilter(filter)) {
        return {
            type: "measureValueFilter",
            measure:
                createIdentifier<any>(filter.using, { forceMetric: true }) ??
                createLocalIdentifier(filter.using),
        };
    }
    if (isRankingFilter(filter)) {
        return {
            type: "rankingFilter",
            measure:
                createIdentifier<any>(filter.using, { forceMetric: true }) ??
                createLocalIdentifier(filter.using),
        };
    }

    return null;
}

function yamlIgnoredFilterToDeclarative(input: string): IDashboardFilterReference | null {
    const ref = parseReferenceObject(input);

    if (ref?.type === "label") {
        return {
            type: "attributeFilterReference",
            displayForm: createIdentifier<any>(input),
        };
    }
    if (ref?.type === "dataset") {
        return {
            type: "dateFilterReference",
            dataSet: createIdentifier<any>(input),
        };
    }
    return null;
}

export function yamlPluginsToDeclarative(plugins: Dashboard["plugins"]) {
    return plugins?.map((plugin) => yamlPluginToDeclarative(plugin));
}

function yamlPluginToDeclarative(input: Required<Dashboard>["plugins"][number]): IDashboardPluginLink {
    if (typeof input === "string") {
        return {
            type: "IDashboardPluginLink",
            plugin: createIdentifier<any>(input, { forceType: "dashboardPlugin" }),
        };
    }
    return {
        type: "IDashboardPluginLink",
        plugin: createIdentifier<any>(input.id, { forceType: "dashboardPlugin" }),
        parameters: serialiseParameters(input.parameters ?? ""),
    };
}

function isFilterGroup(
    filter: unknown,
): filter is { type: "filter_group"; title: string; filters: DashboardFilters } {
    return (
        typeof filter === "object" &&
        filter !== null &&
        "type" in filter &&
        (filter as { type: string }).type === "filter_group" &&
        "filters" in filter
    );
}

function flattenFilters(
    yamlFilters: DashboardFilters | undefined,
): Record<string, DashboardAttributeFilter | DashboardAbsoluteDateFilter | DashboardRelativeDateFilter> {
    if (!yamlFilters) {
        return {};
    }
    const result: Record<
        string,
        DashboardAttributeFilter | DashboardAbsoluteDateFilter | DashboardRelativeDateFilter
    > = {};

    for (const [key, filter] of Object.entries(yamlFilters)) {
        if (isFilterGroup(filter)) {
            // Flatten nested filters from the group
            const nestedFlat = flattenFilters(filter.filters);
            Object.assign(result, nestedFlat);
        } else {
            result[key] = filter as
                | DashboardAttributeFilter
                | DashboardAbsoluteDateFilter
                | DashboardRelativeDateFilter;
        }
    }

    return result;
}

export function yamlFilterContextToDeclarative(
    baseId: string,
    yamlFilters: DashboardFilters | undefined,
): {
    filterContext: DeclarativeFilterContext;
    dateFilterConfig: IDashboardDateFilterConfig | undefined;
    dateFilterConfigs: IDashboardDateFilterConfigItem[] | undefined;
    attributeFilterConfigs: IDashboardAttributeFilterConfig[] | undefined;
    filterGroupsConfig: IDashboardFilterGroupsConfig | undefined;
} {
    const dateFilterConfig: Partial<IDashboardDateFilterConfig> = {};
    const dateFilterConfigs: IDashboardDateFilterConfigItem[] = [];
    const attributeFilterConfigs: IDashboardAttributeFilterConfig[] = [];

    // Extract filter groups configuration
    const filterGroupsConfig = extractFilterGroupsConfig(yamlFilters);

    // Flatten filter groups to get individual filters
    const flatFilters = flattenFilters(yamlFilters);

    const allFilters = Object.entries(flatFilters);
    const attributeFilters = allFilters.filter(([, filter]) => isDashboardAttributeFilter(filter));
    const dateFilters = allFilters.filter(
        ([, filter]) =>
            isDashboardAbsoluteDateFilter(filter) ||
            isDashboardRelativeDateFilter(filter) ||
            isDashboardEmptyDateFilter(filter),
    );

    const filters = Object.keys(flatFilters)
        .map((key) => {
            const filter = flatFilters[key];
            const isAbsoluteDateFilter = isDashboardAbsoluteDateFilter(filter);
            const isRelativeDateFilter = isDashboardRelativeDateFilter(filter);

            if (isAbsoluteDateFilter || isRelativeDateFilter) {
                const emptyValueHandling = extractDashboardEmptyValueHandling(filter);
                //others date filters
                if (filter["date"]) {
                    const dateFilterConf: IDashboardDateFilterConfigItem = {
                        dateDataSet: createIdentifier<any>(filter["date"] as string, {
                            forceType: "dataset",
                        }),
                        config: fillDateFilterConfig(filter),
                    };
                    dateFilterConfigs.push(dateFilterConf);
                    //common date filter
                } else {
                    fillDateFilterConfig(filter, dateFilterConfig);
                    //special case when common filter is empty, do not add it to filter context, but keep settings
                    if (isDashboardNoopDateFilter(filter)) {
                        return null;
                    }
                }

                return {
                    dateFilter: {
                        localIdentifier: key,
                        type: isAbsoluteDateFilter ? "absolute" : "relative",
                        granularity: convertGranularity(filter["granularity"] ?? "DAY"),
                        ...(filter["from"] === undefined ? {} : { from: filter["from"] }),
                        ...(filter["to"] === undefined ? {} : { to: filter["to"] }),
                        ...(filter["date"]
                            ? {
                                  dataSet: createIdentifier(filter["date"] as string, {
                                      forceType: "dataset",
                                  }),
                              }
                            : {}),
                        ...(emptyValueHandling ? { emptyValueHandling } : {}),
                        //attribute
                    },
                };
            }
            if (isDashboardAttributeFilter(filter)) {
                const state = filter.state as State;

                const attributeFilterConfig: Partial<IDashboardAttributeFilterConfig> = {};
                if (filter.mode && filter.mode !== "active") {
                    attributeFilterConfig.mode = filter.mode;
                }

                if (filter.display_as) {
                    attributeFilterConfig.displayAsLabel = createIdentifier<any>(filter.display_as, {
                        forceType: "label",
                    });
                }

                if ((filter.mode && filter.mode !== "active") || filter.display_as) {
                    attributeFilterConfig.localIdentifier = key;
                    attributeFilterConfigs.push(attributeFilterConfig as IDashboardAttributeFilterConfig);
                }

                const attributeParents = filter.parents?.filter((parent) => {
                    const item = normalizeLocalDateFilter(parent);
                    return attributeFilters.some(([key]) => key === item.using);
                });
                const dateParents = filter.parents?.filter((parent) => {
                    const item = normalizeLocalDateFilter(parent);
                    return dateFilters.some(([key]) => key === item.using);
                });
                return {
                    attributeFilter: {
                        displayForm: createIdentifier(filter.using ?? ""),
                        negativeSelection: !state?.include,
                        attributeElements: {
                            uris: (state && (state.exclude ?? state.include)) ?? [],
                        },
                        localIdentifier: key,
                        ...(attributeParents && attributeParents.length > 0
                            ? {
                                  filterElementsBy: attributeParents.map((parent) => {
                                      return {
                                          filterLocalIdentifier: parent,
                                          over: {
                                              attributes: [],
                                          },
                                      };
                                  }),
                              }
                            : {}),
                        ...(dateParents && dateParents.length > 0
                            ? {
                                  filterElementsByDate: dateParents.map((parent) => {
                                      const item = normalizeLocalDateFilter(parent);
                                      return {
                                          filterLocalIdentifier: item.using,
                                          isCommonDate: item.common,
                                      };
                                  }),
                              }
                            : {}),
                        ...(filter.metric_filters
                            ? {
                                  validateElementsBy: filter.metric_filters.map((metricFilter) =>
                                      createIdentifier(metricFilter),
                                  ),
                              }
                            : {}),
                        title: filter.title,
                        selectionMode: filter.multiselect === false ? "single" : "multi",
                    },
                };
            }
            return null;
        })
        .filter(Boolean);

    return {
        dateFilterConfig:
            Object.keys(dateFilterConfig).length > 0
                ? ({ filterName: "", ...dateFilterConfig } as IDashboardDateFilterConfig)
                : undefined,
        attributeFilterConfigs: attributeFilterConfigs.length > 0 ? attributeFilterConfigs : undefined,
        dateFilterConfigs: dateFilterConfigs.length > 0 ? dateFilterConfigs : undefined,
        filterGroupsConfig,
        filterContext: {
            id: createFilterContextId(baseId),
            title: "",
            content: {
                version: "2",
                filters,
            } as FilterContextDefinition,
        },
    };
}

function extractFilterGroupsConfig(
    yamlFilters: DashboardFilters | undefined,
): IDashboardFilterGroupsConfig | undefined {
    if (!yamlFilters) {
        return undefined;
    }

    const groups: IDashboardFilterGroup[] = [];

    for (const [groupId, filter] of Object.entries(yamlFilters)) {
        if (isFilterGroup(filter)) {
            const nestedFilters = filter.filters as DashboardFilters | undefined;
            const filterLocalIdentifiers = nestedFilters ? Object.keys(nestedFilters) : [];

            groups.push({
                title: filter.title,
                localIdentifier: groupId,
                filters: filterLocalIdentifiers.map((filterLocalIdentifier) => ({
                    filterLocalIdentifier,
                })),
            });
        }
    }

    return groups.length > 0 ? { groups } : undefined;
}

function fillDateFilterConfig(
    filter: DashboardAttributeFilter | DashboardAbsoluteDateFilter | DashboardRelativeDateFilter,
    config?: Partial<IDashboardDateFilterConfig>,
): IDashboardDateFilterConfig {
    const current = config ?? {
        mode: "active",
        filterName: "",
    };

    if (filter.mode && filter.mode !== "active") {
        current.mode = filter.mode as DashboardDateFilterConfigMode;
    }
    if (filter.title) {
        current.filterName = filter.title as string;
    }
    return current as IDashboardDateFilterConfig;
}

function useInherit(input: string | "inherit" | undefined | false) {
    return input && input !== "inherit" ? input : "";
}

function serialiseParameters(params: object | string) {
    try {
        return JSON.stringify(params);
    } catch {
        return params as string;
    }
}

function normalizeLocalDateFilter(item: string | LocalDateFilter): LocalDateFilter {
    if (typeof item === "object") {
        return item;
    }
    return {
        using: item,
        common: true,
    };
}
