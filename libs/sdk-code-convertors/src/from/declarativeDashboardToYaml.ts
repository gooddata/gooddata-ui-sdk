// (C) 2023-2026 GoodData Corporation

import { Document, Pair, YAMLMap, YAMLSeq } from "yaml";

import {
    type AfmObjectIdentifier,
    type DeclarativeAnalyticalDashboard,
    type DeclarativeAnalyticalDashboardExtension,
    type DeclarativeFilterContext,
} from "@gooddata/api-client-tiger";
import type { Dashboard, Filter, Visualisation } from "@gooddata/sdk-code-schemas/v1";
import {
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type IDashboardDateFilter,
    type IDashboardDateFilterConfig,
    type IDashboardDateFilterConfigItem,
    type IDashboardDefinition,
    type IDashboardFilterGroup,
    type IDashboardLayout,
    type IDashboardLayoutItem,
    type IDashboardLayoutWidget,
    type IDashboardWidget,
    type IDrillDownIntersectionIgnoredAttributes,
    type IDrillDownReference,
    type IFilterContextDefinition,
    type IInsightWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type InsightDrillDefinition,
    dashboardFilterReferenceObjRef,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isAttributeHierarchyReference,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isNoopAllTimeDashboardDateFilter,
    isRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { VisualisationsTypes } from "../conts.js";
import { type DashboardTab, type FromEntities } from "../types.js";
import { serializeUrlTarget } from "../utils/customUrl.js";
import { CoreErrorCode, newError } from "../utils/errors.js";
import { parseGranularity } from "../utils/granularityUtils.js";
import { fromDeclarativePermissions } from "../utils/permissionUtils.js";
import { collectFieldLevelFilters } from "../utils/sharedUtils.js";
import { DASHBOARD_COMMENT } from "../utils/texts.js";
import {
    createFilterContextItemKeyName,
    entryWithSpace,
    fillOptionalMetaFields,
    getIdentifier,
} from "../utils/yamlUtils.js";

export type OverrideDashboardDefinition = Omit<IDashboardDefinition, "filterContext"> & {
    filterContextRef?: AfmObjectIdentifier;
    tabs?: DashboardTab[];
    activeTabLocalIdentifier?: string;
};

/** @public */
export function declarativeDashboardToYaml(
    entities: FromEntities,
    dashboard: DeclarativeAnalyticalDashboard,
    filterContexts?: DeclarativeFilterContext[],
): {
    content: string;
    json: Dashboard;
} {
    const content = dashboard.content as OverrideDashboardDefinition;

    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "dashboard",
        id: dashboard.id,
    });

    // Add intro comment to the document
    doc.commentBefore = DASHBOARD_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, dashboard);

    //settings
    if (content.disableCrossFiltering) {
        doc.add(entryWithSpace("cross_filtering", false));
    }
    if (content.disableUserFilterReset) {
        doc.add(entryWithSpace("user_filters_reset", false));
    }
    if (content.disableUserFilterSave) {
        doc.add(entryWithSpace("user_filters_save", false));
    }
    if (content.disableFilterViews) {
        doc.add(entryWithSpace("filter_views", false));
    }

    // Add enable_section_headers
    if (content.layout?.configuration?.sections?.enableHeader) {
        doc.add(
            entryWithSpace("enable_section_headers", content.layout?.configuration?.sections?.enableHeader),
        );
    }

    // Add dashboard tabs
    // Note: If there's only 1 tab without a title (implicit first tab visible in edit mode),
    // treat as "no tabs" and use sections format to preserve previous YAML structure
    const hasMultipleTabs = content.tabs && content.tabs.length > 1;
    const hasSingleTabWithTitle = content.tabs && content.tabs.length === 1 && content.tabs[0].title;
    const shouldUseTabs = hasMultipleTabs || hasSingleTabWithTitle;

    if (content.tabs && shouldUseTabs) {
        const tabs = declarativeTabsToYaml(content.tabs, filterContexts, entities);
        if (tabs) {
            doc.add(entryWithSpace("tabs", tabs));
        }
    } else if (content.tabs && content.tabs.length === 1) {
        // Dashboard with implicit single tab - create root yaml structure like without tabs
        // but read all metadata from a single tab
        const tab = content.tabs[0];
        const section = declarativeSectionsToYaml(tab.layout, entities);
        if (section) {
            doc.add(entryWithSpace("sections", section));
        }

        const filterContextId = tab.filterContextRef ? getIdentifier(tab.filterContextRef, true) : undefined;
        const { filters, filtersMap } = declarativeFilterContextToYaml(
            tab.dateFilterConfig,
            filterContexts?.find((fc) => fc.id === filterContextId),
        );
        declarativeFiltersConfigToYaml(
            filtersMap,
            tab.dateFilterConfig,
            tab.dateFilterConfigs,
            tab.attributeFilterConfigs,
        );
        const groupedFilters = declarativeFilterGroupsToYaml(filters, tab.filterGroupsConfig);
        if (groupedFilters.items.length > 0) {
            doc.add(entryWithSpace("filters", groupedFilters));
        }
    } else {
        // Dashboard without tabs - add sections and filters
        const section = declarativeSectionsToYaml(content.layout, entities);
        if (section) {
            doc.add(entryWithSpace("sections", section));
        }

        const filterContextId = content.filterContextRef
            ? getIdentifier(content.filterContextRef, true)
            : undefined;
        const { filters, filtersMap } = declarativeFilterContextToYaml(
            content.dateFilterConfig,
            filterContexts?.find((fc) => fc.id === filterContextId),
        );
        declarativeFiltersConfigToYaml(
            filtersMap,
            content.dateFilterConfig,
            content.dateFilterConfigs,
            content.attributeFilterConfigs,
        );
        if (filters.items.length > 0) {
            doc.add(entryWithSpace("filters", filters));
        }
    }

    // Add KD plugins definitions
    const plugins = declarativePluginsToYaml(content);
    if (plugins) {
        doc.add(entryWithSpace("plugins", plugins));
    }

    // Add dashboard permissions
    const permissions = declarativePermissionsToYaml(doc, dashboard);
    if (permissions) {
        doc.add(entryWithSpace("permissions", permissions));
    }

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as Dashboard,
    };
}

export function declarativeTabsToYaml(
    tabs: DashboardTab[],
    filterContexts?: DeclarativeFilterContext[],
    entities?: FromEntities,
): YAMLSeq | undefined {
    // no tabs
    if (!tabs || tabs.length === 0) {
        return;
    }

    const yamlTabs = new YAMLSeq();

    tabs.forEach((tab) => {
        const yamlTab = new YAMLMap();

        // Add tab id and name
        yamlTab.add(new Pair("id", tab.localIdentifier));
        yamlTab.add(new Pair("title", tab.title));

        // Add tab filters
        let filterContext: DeclarativeFilterContext | undefined;
        if (tab.filterContextRef && filterContexts?.length) {
            const filterContextId = getIdentifier(tab.filterContextRef, true);
            filterContext = filterContexts.find((fc) => fc.id === filterContextId);
        }

        if (filterContext) {
            const { filters, filtersMap } = declarativeFilterContextToYaml(
                tab.dateFilterConfig,
                filterContext,
            );
            declarativeFiltersConfigToYaml(
                filtersMap,
                tab.dateFilterConfig,
                tab.dateFilterConfigs,
                tab.attributeFilterConfigs,
            );
            const groupedFilters = declarativeFilterGroupsToYaml(filters, tab.filterGroupsConfig);

            if (groupedFilters.items.length > 0) {
                yamlTab.add(new Pair("filters", groupedFilters));
            }
        }

        // Add tab sections
        if (tab.layout) {
            const tempDashboard: IDashboardDefinition = {
                layout: tab.layout,
            } as IDashboardDefinition;

            const sections = declarativeSectionsToYaml(tempDashboard.layout, entities);
            if (sections) {
                yamlTab.add(new Pair("sections", sections));
            }
        }

        yamlTabs.add(yamlTab);
    });

    return yamlTabs;
}

export function declarativeSectionsToYaml(layout?: IDashboardLayout, entities?: FromEntities) {
    //no sections at all
    if (!layout?.sections?.length) {
        return;
    }

    const sections = new YAMLSeq();

    layout.sections.forEach((section) => {
        const yamlSection = new YAMLMap();

        if (section.header?.title) {
            yamlSection.add(new Pair("title", section.header.title));
        }

        if (section.header?.description) {
            yamlSection.add(new Pair("description", section.header.description));
        }

        if (section.items?.length) {
            const items = new YAMLSeq();
            section.items.forEach((item: IDashboardLayoutItem) => {
                const widget = declarativeWidgetToYaml(item.widget, item.size, entities);
                if (widget) {
                    items.add(widget);
                }
            });

            yamlSection.add(new Pair("widgets", items));
        }

        sections.add(yamlSection);
    });

    return sections;
}

export function declarativeWidgetToYaml(
    widget?: IDashboardWidget | null,
    size?: IDashboardLayoutItem["size"],
    entities?: FromEntities,
) {
    if (!widget) {
        return;
    }
    switch (widget?.type) {
        case "insight":
            return declarativeInsightWidgetToYaml(widget as IInsightWidget, size, entities);
        case "richText":
            return declarativeRichTextWidgetToYaml(widget as IRichTextWidget, size);
        case "visualizationSwitcher":
            return declarativeVisualizationSwitcherWidgetToYaml(
                widget as IVisualizationSwitcherWidget,
                size,
                entities,
            );
        case "IDashboardLayout":
            return declarativeContainerWidgetToYaml(widget as IDashboardLayoutWidget, size, entities);
        default:
            throw newError(CoreErrorCode.ReferenceTypeNotSupported, [String(widget?.type)]);
    }
}

export function declarativeInsightWidgetToYaml(
    widget: IInsightWidget,
    size?: IDashboardLayoutItem["size"],
    entities?: FromEntities,
) {
    const yamlWidget = new YAMLMap();

    // Local id of widget
    if (widget.localIdentifier) {
        yamlWidget.add(new Pair("id", widget.localIdentifier));
    }

    // The visualization
    yamlWidget.add(new Pair("visualization", getIdentifier(widget.insight, true)));

    // Title
    if (widget.configuration?.hideTitle) {
        yamlWidget.add(new Pair("title", false));
    } else if (widget.title) {
        yamlWidget.add(new Pair("title", widget.title));
    }

    // Description
    if (widget.configuration?.description?.visible === false) {
        yamlWidget.add(new Pair("description", false));
    } else if (widget.configuration?.description?.source === "insight") {
        //NOTE: Inherit description is default, so do not add it into yaml
    } else if (widget.description) {
        yamlWidget.add(new Pair("description", widget.description));
    }

    // Size
    if (size?.xl?.gridWidth) {
        yamlWidget.add(new Pair("columns", size.xl.gridWidth));
    }
    if (size?.xl?.gridHeight) {
        yamlWidget.add(new Pair("rows", size.xl.gridHeight));
    }

    // Filtering
    if (widget.dateDataSet) {
        yamlWidget.add(new Pair("date", getIdentifier(widget.dateDataSet, true)));
    }
    if (widget.ignoreDashboardFilters?.length) {
        yamlWidget.add(
            new Pair(
                "ignored_filters",
                widget.ignoreDashboardFilters.map((df) => {
                    return getIdentifier(dashboardFilterReferenceObjRef(df));
                }),
            ),
        );
    }

    // Interactions
    if (widget.properties?.["controls"]?.zoomInsight) {
        yamlWidget.add(new Pair("zoom_data", true));
    }
    if (widget.drills?.length) {
        const drills = new YAMLSeq();
        const sourceVisualizationId = getIdentifier(widget.insight, true);
        widget.drills.forEach((drill) => {
            drills.add(declarativeDrillToYaml(drill, entities, sourceVisualizationId));
        });
        yamlWidget.add(new Pair("interactions", drills));
    }
    if (widget.ignoredDrillDownHierarchies?.length) {
        const ignores = widget.ignoredDrillDownHierarchies.map((hierarchy) =>
            declarativeIgnoreDrillDownHierarchyToYaml(hierarchy),
        );
        yamlWidget.add(new Pair("ignored_drill_downs", ignores));
    }
    if (widget.drillDownIntersectionIgnoredAttributes?.length) {
        const ignores = widget.drillDownIntersectionIgnoredAttributes
            .map((hierarchy) => declarativeDrillDownIntersectionIgnoredAttributesToYaml(hierarchy))
            .filter(Boolean);
        yamlWidget.add(new Pair("ignored_drill_downs_intersections", ignores));
    }

    // Cross filtering
    if (widget.ignoreCrossFiltering) {
        yamlWidget.add(new Pair("ignored_cross_filtering", true));
    }

    return yamlWidget;
}

export function declarativeIgnoreDrillDownHierarchyToYaml(hierarchy: IDrillDownReference) {
    if (isAttributeHierarchyReference(hierarchy)) {
        return {
            hierarchy: hierarchy.attributeHierarchy as unknown as string,
            on: getIdentifier(hierarchy.attribute),
        };
    }

    return {
        template: hierarchy.dateHierarchyTemplate as unknown as string,
        on: getIdentifier(hierarchy.dateDatasetAttribute),
    };
}

export function declarativeDrillDownIntersectionIgnoredAttributesToYaml(
    hierarchy: IDrillDownIntersectionIgnoredAttributes,
) {
    if (hierarchy.ignoredAttributes.length === 0) {
        return null;
    }
    return {
        attributes: hierarchy.ignoredAttributes,
        hierarchy: declarativeIgnoreDrillDownHierarchyToYaml(hierarchy.drillDownReference),
    };
}

export function declarativeRichTextWidgetToYaml(
    widget: IRichTextWidget,
    size?: IDashboardLayoutItem["size"],
) {
    const yamlWidget = new YAMLMap();

    // Local id of widget
    if (widget.localIdentifier) {
        yamlWidget.add(new Pair("id", widget.localIdentifier));
    }

    // The visualization
    yamlWidget.add(new Pair("content", widget.content));

    // Size
    if (size?.xl?.gridWidth) {
        yamlWidget.add(new Pair("columns", size.xl.gridWidth));
    }
    if (size?.xl?.gridHeight) {
        yamlWidget.add(new Pair("rows", size.xl.gridHeight));
    }

    return yamlWidget;
}

export function declarativeVisualizationSwitcherWidgetToYaml(
    widget: IVisualizationSwitcherWidget,
    size?: IDashboardLayoutItem["size"],
    entities?: FromEntities,
) {
    const yamlWidget = new YAMLMap();

    // Local id of widget
    if (widget.localIdentifier) {
        yamlWidget.add(new Pair("id", widget.localIdentifier));
    }

    // The visualizations
    yamlWidget.add(
        new Pair(
            "visualizations",
            widget.visualizations.map((vis) => declarativeInsightWidgetToYaml(vis, undefined, entities)),
        ),
    );

    // Size
    if (size?.xl?.gridWidth) {
        yamlWidget.add(new Pair("columns", size.xl.gridWidth));
    }
    if (size?.xl?.gridHeight) {
        yamlWidget.add(new Pair("rows", size.xl.gridHeight));
    }

    return yamlWidget;
}

export function declarativeContainerWidgetToYaml(
    widget: IDashboardLayoutWidget,
    size?: IDashboardLayoutItem["size"],
    entities?: FromEntities,
) {
    const yamlWidget = new YAMLMap();

    // Local id of widget
    if (widget.localIdentifier) {
        yamlWidget.add(new Pair("container", widget.localIdentifier));
    }

    // Size
    if (size?.xl?.gridWidth) {
        yamlWidget.add(new Pair("columns", size.xl.gridWidth));
    }
    if (size?.xl?.gridHeight) {
        yamlWidget.add(new Pair("rows", size.xl.gridHeight));
    }

    // Layout direction
    if (widget.configuration?.direction) {
        yamlWidget.add(new Pair("layout_direction", widget.configuration?.direction));
    }

    // Enable header configuration
    if (widget.configuration?.sections) {
        yamlWidget.add(new Pair("enable_section_headers", widget.configuration.sections.enableHeader));
    }

    // Nested sections
    if (widget.sections?.length) {
        const nestedSections = new YAMLSeq();
        widget.sections.forEach((section) => {
            const yamlSection = new YAMLMap();

            if (section.header?.title) {
                yamlSection.add(new Pair("title", section.header.title));
            }

            if (section.header?.description) {
                yamlSection.add(new Pair("description", section.header.description));
            }

            if (section.items?.length) {
                const widgets = new YAMLSeq();
                section.items.forEach((item) => {
                    const yamlNestedWidget = declarativeWidgetToYaml(item.widget, item.size, entities);
                    if (yamlNestedWidget) {
                        widgets.add(yamlNestedWidget);
                    }
                });
                yamlSection.add(new Pair("widgets", widgets));
            }

            nestedSections.add(yamlSection);
        });
        yamlWidget.add(new Pair("sections", nestedSections));
    }

    return yamlWidget;
}

export function declarativeDrillToYaml(
    drill: InsightDrillDefinition,
    entities?: FromEntities,
    sourceVisualizationId?: string,
) {
    const drillYaml = new YAMLMap();

    const originIdentifier =
        drill.origin.type === "drillFromMeasure" ? drill.origin.measure : drill.origin.attribute;

    drillYaml.add(new Pair("click_on", getIdentifier(originIdentifier)));

    if (isDrillToInsight(drill)) {
        drillYaml.add(new Pair("open_visualization", getIdentifier(drill.target, true)));
        const filters = drillFiltersToYaml(drill, entities, sourceVisualizationId);
        if (filters) {
            drillYaml.add(new Pair("filters", filters));
        }
        return drillYaml;
    }

    if (isDrillToDashboard(drill) && drill.target) {
        const dashboardDrill = drill as typeof drill & {
            ignoredDashboardFilters?: string[];
            includedSourceInsightFiltersObjRefs?: any[];
            includedSourceMeasureFiltersObjRefs?: any[];
        };
        drillYaml.add(new Pair("open_dashboard", getIdentifier(drill.target, true)));
        if (drill.targetTabLocalIdentifier) {
            drillYaml.add(new Pair("open_dashboard_tab", drill.targetTabLocalIdentifier));
        }
        const filters = drillFiltersToYaml(dashboardDrill, entities, sourceVisualizationId);
        if (filters) {
            drillYaml.add(new Pair("filters", filters));
        }
        return drillYaml;
    }

    if (isDrillToCustomUrl(drill)) {
        if (drill.drillIntersectionIgnoredAttributes?.length) {
            const attrs = new YAMLSeq();
            drill.drillIntersectionIgnoredAttributes.forEach((attr) => attrs.add(attr));
            drillYaml.add(new Pair("ignored_intersection_attributes", attrs));
        }
        drillYaml.add(new Pair("open_url", serializeUrlTarget(drill.target.url as any)));
        return drillYaml;
    }

    if (isDrillToAttributeUrl(drill)) {
        if (drill.drillIntersectionIgnoredAttributes?.length) {
            const attrs = new YAMLSeq();
            drill.drillIntersectionIgnoredAttributes.forEach((attr) => attrs.add(attr));
            drillYaml.add(new Pair("ignored_intersection_attributes", attrs));
        }
        drillYaml.add(
            new Pair("open_url", {
                label: getIdentifier(drill.target.displayForm),
                href: getIdentifier(drill.target.hyperlinkDisplayForm),
            }),
        );
        return drillYaml;
    }

    return drillYaml;
}

function drillFiltersToYaml(
    drill: InsightDrillDefinition & {
        ignoredDashboardFilters?: string[];
        includedSourceInsightFiltersObjRefs?: any[];
        includedSourceMeasureFiltersObjRefs?: any[];
    },
    entities?: FromEntities,
    sourceVisualizationId?: string,
) {
    const filtersYaml = new YAMLMap();
    const excludeYaml = new YAMLMap();
    const includeYaml = new YAMLMap();

    if (drill.drillIntersectionIgnoredAttributes?.length) {
        const attrs = new YAMLSeq();
        drill.drillIntersectionIgnoredAttributes.forEach((attr) => attrs.add(attr));
        excludeYaml.add(new Pair("drilled_datapoint", attrs));
    }

    if (drill.ignoredDashboardFilters?.length) {
        const filters = new YAMLSeq();
        drill.ignoredDashboardFilters.forEach((filter) => filters.add(filter));
        excludeYaml.add(new Pair("dashboard_filters", filters));
    }

    if (drill.includedSourceInsightFiltersObjRefs?.length) {
        includeYaml.add(
            new Pair(
                "visualization_filters",
                filterRefsToYaml(drill.includedSourceInsightFiltersObjRefs, entities, sourceVisualizationId),
            ),
        );
    }

    if (drill.includedSourceMeasureFiltersObjRefs?.length) {
        includeYaml.add(
            new Pair(
                "metric_filters",
                sourceMeasureFilterRefsToYaml(
                    drill.includedSourceMeasureFiltersObjRefs,
                    entities,
                    sourceVisualizationId,
                ),
            ),
        );
    }

    if (excludeYaml.items.length) {
        filtersYaml.add(new Pair("exclude", excludeYaml));
    }
    if (includeYaml.items.length) {
        filtersYaml.add(new Pair("include", includeYaml));
    }

    return filtersYaml.items.length ? filtersYaml : null;
}

function filterRefsToYaml(
    refs: Array<{ type: string; [key: string]: any }>,
    entities?: FromEntities,
    sourceVisualizationId?: string,
): string[] {
    const visualisation = entities?.find(
        (entity) => VisualisationsTypes.includes(entity.type) && entity.id === sourceVisualizationId,
    )?.data as Visualisation | undefined;
    const filters = visualisation?.query?.filter_by;

    return refs
        .map((ref) => findSourceInsightFilterId(filters, ref) ?? sourceInsightFilterRefFallbackId(ref))
        .filter(Boolean) as string[];
}

function findSourceInsightFilterId(
    filters: NonNullable<Visualisation["query"]>["filter_by"] | undefined,
    ref: { type: string; [key: string]: any },
): string | undefined {
    if (!filters) {
        return undefined;
    }

    return Object.entries(filters).find(([_, filter]) => matchesSourceInsightFilterRef(filter, ref))?.[0];
}

function matchesSourceInsightFilterRef(filter: Filter, ref: { type: string; [key: string]: any }) {
    switch (ref.type) {
        case "attributeFilter":
            return filter.type === "attribute_filter" && filter.using === getIdentifier(ref["label"]);
        case "dateFilter":
            return filter.type === "date_filter" && filter.using === getIdentifier(ref["dataSet"], true);
        case "measureValueFilter":
            return filter.type === "metric_value_filter" && filter.using === getIdentifier(ref["measure"]);
        case "rankingFilter":
            return filter.type === "ranking_filter" && filter.using === getIdentifier(ref["measure"]);
        default:
            return false;
    }
}

function sourceInsightFilterRefFallbackId(ref: { type: string; [key: string]: any }): string | null {
    switch (ref.type) {
        case "attributeFilter":
            return getIdentifier(ref["label"]);
        case "dateFilter":
            return getIdentifier(ref["dataSet"], true);
        case "measureValueFilter":
        case "rankingFilter":
            return getIdentifier(ref["measure"]);
        default:
            return null;
    }
}

function sourceMeasureFilterRefsToYaml(
    refs: Array<{ type: string; [key: string]: any }>,
    entities?: FromEntities,
    sourceVisualizationId?: string,
): string[] {
    const visualisation = entities?.find(
        (entity) => VisualisationsTypes.includes(entity.type) && entity.id === sourceVisualizationId,
    )?.data as Visualisation | undefined;
    const fieldFilters = collectFieldLevelFilters(visualisation);

    return refs
        .map((ref) => findSourceInsightFilterId(fieldFilters, ref) ?? sourceInsightFilterRefFallbackId(ref))
        .filter(Boolean) as string[];
}

export type FilterContextItem = { yaml: YAMLMap; filter: IFilterContextDefinition["filters"][number] };
type EmptyValueHandling = NonNullable<IDashboardDateFilter["dateFilter"]["emptyValueHandling"]>;

function getDateFilterEmptyValueHandling(filter: IDashboardDateFilter): EmptyValueHandling | undefined {
    const value = filter.dateFilter.emptyValueHandling;
    if (value === "include" || value === "exclude" || value === "only") {
        return value;
    }
    return undefined;
}

export function declarativeFilterContextToYaml(
    dateFilterConfig?: IDashboardDateFilterConfig,
    filterContext?: DeclarativeFilterContext,
) {
    const filters: Array<Pair> = [];
    const filtersMap: { [key: string]: FilterContextItem } = {};
    const content = filterContext ? (filterContext.content as IFilterContextDefinition) : undefined;

    const declarativeFilters = content?.filters ?? [];

    declarativeFilters.forEach((filter) => {
        if (isDashboardDateFilter(filter) && isNoopAllTimeDashboardDateFilter(filter)) {
            return;
        }

        const key = createFilterContextItemKeyName(filter);
        if (isDashboardDateFilter(filter)) {
            const def = declarativeDateFilterToYaml(filter);
            filters.push(new Pair(key, def));
            filtersMap[key] = {
                yaml: def,
                filter: filter as IFilterContextDefinition["filters"][number],
            };
        }
        if (isDashboardAttributeFilter(filter)) {
            const def = declarativeAttributeFilterToYaml(filter);
            filters.push(new Pair(key, def));
            filtersMap[key] = {
                yaml: def,
                filter: filter as IFilterContextDefinition["filters"][number],
            };
        }
    });

    // create default date if config is specified but no common date
    const commonFilter = declarativeFilters.find((filter) => {
        if (isDashboardDateFilter(filter)) {
            return !filter.dateFilter.dataSet;
        }
        return false;
    });
    if (!commonFilter && dateFilterConfig) {
        const filter: IDashboardDateFilter = {
            dateFilter: {
                granularity: "GDC.time.date",
                type: "absolute",
            },
        };
        const key = createFilterContextItemKeyName(filter, "common");
        const def = declarativeDateFilterToYaml(filter);

        filters.unshift(new Pair(key, def));
        filtersMap[key] = {
            yaml: def,
            filter: filter as IFilterContextDefinition["filters"][number],
        };
    }

    Object.values(filtersMap).forEach(({ filter, yaml }) => {
        if (isDashboardAttributeFilter(filter)) {
            //parents attribute filters
            const attrsIds = filter.attributeFilter.filterElementsBy
                ?.map((element) => {
                    return element.filterLocalIdentifier ?? null;
                })
                .filter(Boolean);

            //parents date filters
            const datesIds = filter.attributeFilter.filterElementsByDate
                ?.map((element) => {
                    if (!element.isCommonDate && element.filterLocalIdentifier) {
                        return {
                            using: element.filterLocalIdentifier,
                            common: element.isCommonDate,
                        };
                    }
                    return element.filterLocalIdentifier ?? null;
                })
                .filter(Boolean);

            const ids = [...(attrsIds ?? []), ...(datesIds ?? [])];

            if (ids?.length) {
                yaml.add(new Pair("parents", ids));
            }

            //metric filters
            const metricsIds = filter.attributeFilter.validateElementsBy
                ?.map((element) => getIdentifier(element))
                .filter(Boolean);

            if (metricsIds?.length) {
                yaml.add(new Pair("metric_filters", metricsIds));
            }
        }
    });

    return {
        filters: filters.reduce((map, filter) => {
            map.add(filter);
            return map;
        }, new YAMLMap()),
        filtersMap,
    };
}

function declarativeDateFilterToYaml(filter: IDashboardDateFilter) {
    const dateFilter = new YAMLMap();

    dateFilter.add(new Pair("type", "date_filter"));

    const gran = parseGranularity(filter.dateFilter.granularity);
    if (gran !== "DAY") {
        dateFilter.add(new Pair("granularity", gran));
    }

    if (filter.dateFilter.dataSet) {
        dateFilter.add(new Pair("date", getIdentifier(filter.dateFilter.dataSet, true)));
    }

    if (isRelativeDashboardDateFilter(filter)) {
        // Relative filter
        // Casting and parsing cause server may return string sometimes, invalid typing...
        if (typeof filter.dateFilter.from === "number" && typeof filter.dateFilter.to === "number") {
            dateFilter.add(new Pair("from", parseInt(String(filter.dateFilter.from), 10)));
            dateFilter.add(new Pair("to", parseInt(String(filter.dateFilter.to), 10)));
        }
    } else {
        // Absolute filter
        if (filter.dateFilter.from) {
            dateFilter.add(new Pair("from", filter.dateFilter.from));
        }
        if (filter.dateFilter.to) {
            dateFilter.add(new Pair("to", filter.dateFilter.to));
        }
    }

    const emptyValueHandling = getDateFilterEmptyValueHandling(filter);
    if (emptyValueHandling) {
        dateFilter.add(new Pair("empty_values", emptyValueHandling));
    }

    return dateFilter;
}

function declarativeAttributeFilterToYaml(filter: IDashboardAttributeFilter) {
    const attributeFilter = new YAMLMap();

    attributeFilter.add(new Pair("type", "attribute_filter"));
    if (filter.attributeFilter.title) {
        attributeFilter.add(new Pair("title", filter.attributeFilter.title));
    }

    const attributeId = getIdentifier(filter.attributeFilter.displayForm);
    attributeFilter.add(new Pair("using", attributeId));

    if (filter.attributeFilter.selectionMode === "single") {
        attributeFilter.add(new Pair("multiselect", false));
    }

    let values: Array<string | null> = [];
    if (isAttributeElementsByValue(filter.attributeFilter.attributeElements)) {
        values = filter.attributeFilter.attributeElements.values;
    }
    if (isAttributeElementsByRef(filter.attributeFilter.attributeElements)) {
        values = filter.attributeFilter.attributeElements.uris;
    }

    if (!filter.attributeFilter.negativeSelection) {
        const state = new YAMLMap();
        state.add(new Pair("include", values));
        attributeFilter.add(new Pair("state", state));
    }

    if (filter.attributeFilter.negativeSelection && values.length) {
        const state = new YAMLMap();
        state.add(new Pair("exclude", values));
        attributeFilter.add(new Pair("state", state));
    }

    return attributeFilter;
}

export function declarativeFiltersConfigToYaml(
    filtersMap: Record<string, FilterContextItem>,
    dateFilterConfig?: IDashboardDateFilterConfig,
    dateFilterConfigs?: IDashboardDateFilterConfigItem[],
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
) {
    attributeFilterConfigs?.forEach((filterSettings) => {
        const filter = filtersMap[filterSettings.localIdentifier];
        if (filter) {
            if (filterSettings.mode && filterSettings.mode !== "active") {
                filter.yaml.add(new Pair("mode", filterSettings.mode));
            }
            if (filterSettings.displayAsLabel) {
                filter.yaml.add(new Pair("display_as", getIdentifier(filterSettings.displayAsLabel)));
            }
        }
    });
    dateFilterConfigs?.forEach((filterSettings) => {
        const filter = Object.values(filtersMap).find(
            (filter) => filter.yaml.get("date") === getIdentifier(filterSettings.dateDataSet, true),
        );
        fillDateFilterConfig(filterSettings.config, filter);
    });
    if (dateFilterConfig) {
        const filter = Object.values(filtersMap).find(
            (filter) => filter.yaml.get("type") === "date_filter" && !filter.yaml.get("date"),
        );

        fillDateFilterConfig(dateFilterConfig, filter);
    }
}

function fillDateFilterConfig(
    config: OverrideDashboardDefinition["dateFilterConfig"],
    filter?: FilterContextItem | null,
) {
    if (!filter || !config) {
        return;
    }

    if (config.mode !== "active") {
        filter.yaml.add(new Pair("mode", config.mode));
    }
    if (config.filterName) {
        filter.yaml.add(new Pair("title", config.filterName));
    }

    //NOTE: What is it and where?, Not supported now
    //filterSettings.config.addPresets
    //filterSettings.config.hideOptions
    //filterSettings.config.hideGranularities
}

export function declarativeFilterGroupsToYaml(
    filters: YAMLMap,
    filterGroupsConfig?: DashboardTab["filterGroupsConfig"],
): YAMLMap {
    if (!filterGroupsConfig) {
        return filters;
    }
    const sanitizedGroupIds = sanitizeGroupIds(
        filterGroupsConfig.groups.map((group) => [group, getFilterGroupIdBase(group)] as const),
    );
    const groupedFilters = new YAMLMap();
    filters.items.forEach((filter) => {
        const groupConfig = filterGroupsConfig.groups.find((group) =>
            group.filters.some(({ filterLocalIdentifier }) => filterLocalIdentifier === filter.key),
        );
        if (!groupConfig) {
            groupedFilters.add(filter);
            return;
        }
        const groupWithId = sanitizedGroupIds.find(([group]) => group === groupConfig);
        if (!groupWithId) {
            throw new Error(`Failed to generate id for filter group ${groupConfig.title}`);
        }
        const [_, groupId] = groupWithId;
        const existingGroup = groupedFilters.get(groupId) as YAMLMap;
        if (existingGroup) {
            const filtersInGroup = existingGroup.get("filters") as YAMLMap;
            filtersInGroup.add(filter);
        } else {
            const newGroup = new YAMLMap();
            newGroup.add(new Pair("type", "filter_group"));
            newGroup.add(new Pair("title", groupConfig.title));
            const filtersInGroup = new YAMLMap();
            filtersInGroup.add(filter);
            newGroup.add(new Pair("filters", filtersInGroup));
            groupedFilters.add(new Pair(groupId, newGroup));
        }
    });
    return groupedFilters;
}

type FilterGroupWithId = readonly [IDashboardFilterGroup, string];

function sanitizeGroupIds(filterGroupIds: FilterGroupWithId[]): FilterGroupWithId[] {
    const equalClusters: Record<string, IDashboardFilterGroup[]> = {};
    filterGroupIds.forEach(([_, thisId]) => {
        const cluster = filterGroupIds.filter(([_, id]) => thisId === id).map(([filterGroup]) => filterGroup);
        if (cluster.length > 1) {
            equalClusters[thisId] = cluster;
        }
    });
    if (Object.keys(equalClusters).length === 0) {
        return filterGroupIds;
    }
    const newFilterGroupIds = filterGroupIds.map(([filterGroup, oldId]): FilterGroupWithId => {
        if (filterGroup.localIdentifier) {
            return [filterGroup, filterGroup.localIdentifier];
        }
        const cluster = equalClusters[oldId];
        if (!cluster?.length) {
            return [filterGroup, oldId];
        }
        const groupIndex = cluster
            .filter((group) => !group.localIdentifier)
            .findIndex((group) => group === filterGroup);
        const newId = `${oldId}_${groupIndex + 1}`;
        return [filterGroup, newId];
    });
    return sanitizeGroupIds(newFilterGroupIds);
}

function getFilterGroupIdBase({ title, localIdentifier }: IDashboardFilterGroup) {
    if (localIdentifier) {
        return localIdentifier;
    }
    return title
        .normalize()
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
}

export function declarativePluginsToYaml(dashboard: IDashboardDefinition) {
    if (!dashboard.plugins?.length) {
        return;
    }

    const plugins = new YAMLSeq();

    dashboard.plugins.forEach((plugin) => {
        const pluginId = getIdentifier(plugin.plugin, true);
        if (plugin.parameters?.length) {
            plugins.add({
                id: pluginId,
                parameters: parseParameters(plugin.parameters),
            });
        } else {
            plugins.add(pluginId);
        }
    });

    return plugins;
}

export function declarativePermissionsToYaml(
    doc: Document,
    dashboard: DeclarativeAnalyticalDashboard | DeclarativeAnalyticalDashboardExtension,
) {
    const permissions = fromDeclarativePermissions(dashboard.permissions);

    if (!permissions) {
        return;
    }

    return doc.createNode(permissions);
}

function parseParameters(params: string) {
    try {
        return JSON.parse(params);
    } catch {
        return params;
    }
}
