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
    type IDashboardArbitraryAttributeFilter,
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
    type IDashboardMatchAttributeFilter,
    type IDashboardMeasureValueFilter,
    type IDashboardMeasureValueFilterConfig,
    type IDashboardWidget,
    type IDrillDownIntersectionIgnoredAttributes,
    type IDrillDownReference,
    type IFilterContextDefinition,
    type IInsightWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type InsightDrillDefinition,
    type MeasureValueFilterCondition,
    dashboardFilterReferenceObjRef,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isAttributeHierarchyReference,
    isComparisonCondition,
    isDashboardArbitraryAttributeFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isDashboardMatchAttributeFilter,
    isDashboardMeasureValueFilter,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isNoopAllTimeDashboardDateFilter,
    isRangeCondition,
    isRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { VisualisationsTypes } from "../conts.js";
import { type DashboardTab, type FromEntities } from "../types.js";
import { serializeUrlTarget } from "../utils/customUrl.js";
import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "../utils/errors.js";
import { matchConditionToYaml } from "../utils/filterUtils.js";
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

/** @internal */
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
    context?: IErrorContext,
): {
    content: string;
    json: Dashboard;
} {
    const errorContext = updateErrorContext(context, {
        type: "dashboard",
        path: ["dashboard", dashboard.id],
        data: {},
    });
    const content = dashboard.content as OverrideDashboardDefinition;

    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "dashboard",
        id: dashboard.id,
    });

    // Add intro comment to the document
    doc.commentBefore = DASHBOARD_COMMENT;

    // Infer the YAML model version from the declarative structure:
    //  - V3 (tabs are the sole source of content) when tabs are present and no root-level
    //    layout / filter configs / parameters exist.
    //  - V2 (legacy) otherwise — covers both root-only dashboards and tab dashboards that
    //    still carry mirrored root content for backward compatibility.
    const hasContentTabs = (content.tabs?.length ?? 0) > 0;
    const hasRootContent = Boolean(
        content.layout ||
        content.dateFilterConfig ||
        (content.dateFilterConfigs && content.dateFilterConfigs.length > 0) ||
        (content.attributeFilterConfigs && content.attributeFilterConfigs.length > 0) ||
        (content.measureValueFilterConfigs && content.measureValueFilterConfigs.length > 0) ||
        (content.parameters && content.parameters.length > 0),
    );
    const yamlVersion: "2" | "3" = hasContentTabs && !hasRootContent ? "3" : "2";
    doc.add(entryWithSpace("version", yamlVersion));

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

    if (content.disablePersistentFiltersAcrossTabs) {
        doc.add(entryWithSpace("persistent_filters_across_tabs", false));
    }

    // Add dashboard tabs
    // Note: If there's only 1 tab without a title (implicit first tab visible in edit mode),
    // treat as "no tabs" and use sections format to preserve previous YAML structure
    const hasMultipleTabs = content.tabs && content.tabs.length > 1;
    const hasSingleTabWithTitle = content.tabs?.length === 1 && content.tabs[0].title;
    const shouldUseTabs = hasMultipleTabs || hasSingleTabWithTitle;

    if (content.tabs && shouldUseTabs) {
        // Add enable_section_headers
        if (content.tabs[0].layout?.configuration?.sections?.enableHeader) {
            doc.add(
                entryWithSpace(
                    "enable_section_headers",
                    content.tabs[0].layout?.configuration?.sections?.enableHeader,
                ),
            );
        }
        const tabs = declarativeTabsToYaml(
            content.tabs,
            filterContexts,
            entities,
            updateErrorContext(errorContext, { path: ["tabs"] }),
        );
        if (tabs) {
            doc.add(entryWithSpace("tabs", tabs));
        }
    } else if (content.tabs?.length === 1) {
        // Add enable_section_headers
        if (content.tabs[0].layout?.configuration?.sections?.enableHeader) {
            doc.add(
                entryWithSpace(
                    "enable_section_headers",
                    content.tabs[0].layout?.configuration?.sections?.enableHeader,
                ),
            );
        }
        // Dashboard with implicit single tab - create root yaml structure like without tabs
        // but read all metadata from a single tab
        const tab = content.tabs[0];
        const section = declarativeSectionsToYaml(
            tab.layout,
            entities,
            updateErrorContext(errorContext, { path: ["tabs", "0"] }),
        );
        if (section) {
            doc.add(entryWithSpace("sections", section));
        }

        const filterContextId = tab.filterContextRef
            ? getIdentifier(
                  tab.filterContextRef,
                  true,
                  updateErrorContext(errorContext, { path: ["filterContext"] }),
              )
            : undefined;
        const { filters, filtersMap } = declarativeFilterContextToYaml(
            tab.dateFilterConfig,
            filterContexts?.find((fc) => fc.id === filterContextId),
            updateErrorContext(errorContext, { path: ["dateFilterConfig"] }),
        );
        declarativeFiltersConfigToYaml(
            filtersMap,
            tab.dateFilterConfig,
            tab.dateFilterConfigs,
            tab.attributeFilterConfigs,
            tab.measureValueFilterConfigs,
            errorContext,
        );
        const groupedFilters = declarativeFilterGroupsToYaml(filters, tab.filterGroupsConfig);
        if (groupedFilters.items.length > 0) {
            doc.add(entryWithSpace("filters", groupedFilters));
        }
    } else {
        // Dashboard without tabs - add sections and filters
        // Add enable_section_headers
        if (content.layout?.configuration?.sections?.enableHeader) {
            doc.add(
                entryWithSpace(
                    "enable_section_headers",
                    content.layout?.configuration?.sections?.enableHeader,
                ),
            );
        }
        const section = declarativeSectionsToYaml(
            content.layout,
            entities,
            updateErrorContext(errorContext, { path: ["layout"] }),
        );
        if (section) {
            doc.add(entryWithSpace("sections", section));
        }

        const filterContextId = content.filterContextRef
            ? getIdentifier(
                  content.filterContextRef,
                  true,
                  updateErrorContext(errorContext, { path: ["filterContext"] }),
              )
            : undefined;
        const { filters, filtersMap } = declarativeFilterContextToYaml(
            content.dateFilterConfig,
            filterContexts?.find((fc) => fc.id === filterContextId),
            updateErrorContext(errorContext, { path: ["dateFilterConfig"] }),
        );
        declarativeFiltersConfigToYaml(
            filtersMap,
            content.dateFilterConfig,
            content.dateFilterConfigs,
            content.attributeFilterConfigs,
            content.measureValueFilterConfigs,
            errorContext,
        );
        if (filters.items.length > 0) {
            doc.add(entryWithSpace("filters", filters));
        }
    }

    // Add KD plugins definitions
    const plugins = declarativePluginsToYaml(
        content,
        updateErrorContext(errorContext, { path: ["plugins"] }),
    );
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

/** @internal */
export function declarativeTabsToYaml(
    tabs: DashboardTab[],
    filterContexts?: DeclarativeFilterContext[],
    entities?: FromEntities,
    errorContext?: IErrorContext,
): YAMLSeq | undefined {
    // no tabs
    if (!tabs || tabs.length === 0) {
        return;
    }

    const yamlTabs = new YAMLSeq();

    tabs.forEach((tab, ti) => {
        const yamlTab = new YAMLMap();
        const tabErrorContext = updateErrorContext(errorContext, { path: [ti.toString()] });

        // Add tab id and name
        yamlTab.add(new Pair("id", tab.localIdentifier));
        yamlTab.add(new Pair("title", tab.title));

        // Add tab filters
        let filterContext: DeclarativeFilterContext | undefined;
        if (tab.filterContextRef && filterContexts?.length) {
            const filterContextId = getIdentifier(tab.filterContextRef, true, tabErrorContext);
            filterContext = filterContexts.find((fc) => fc.id === filterContextId);
        }

        if (filterContext) {
            const { filters, filtersMap } = declarativeFilterContextToYaml(
                tab.dateFilterConfig,
                filterContext,
                updateErrorContext(tabErrorContext, { path: ["dateFilterConfig"] }),
            );
            declarativeFiltersConfigToYaml(
                filtersMap,
                tab.dateFilterConfig,
                tab.dateFilterConfigs,
                tab.attributeFilterConfigs,
                tab.measureValueFilterConfigs,
                tabErrorContext,
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

            const sections = declarativeSectionsToYaml(
                tempDashboard.layout,
                entities,
                updateErrorContext(tabErrorContext, { path: ["layout"] }),
            );
            if (sections) {
                yamlTab.add(new Pair("sections", sections));
            }
        }

        yamlTabs.add(yamlTab);
    });

    return yamlTabs;
}

/** @internal */
export function declarativeSectionsToYaml(
    layout?: IDashboardLayout,
    entities?: FromEntities,
    errorContext?: IErrorContext,
) {
    //no sections at all
    if (!layout?.sections?.length) {
        return;
    }

    const sections = new YAMLSeq();

    layout.sections.forEach((section, si) => {
        const yamlSection = new YAMLMap();
        const sectionErrorContext = updateErrorContext(errorContext, { path: ["sections", si.toString()] });

        if (section.header?.title) {
            yamlSection.add(new Pair("title", section.header.title));
        }

        if (section.header?.description) {
            yamlSection.add(new Pair("description", section.header.description));
        }

        if (section.items?.length) {
            const items = new YAMLSeq();
            section.items.forEach((item: IDashboardLayoutItem, i) => {
                const widget = declarativeWidgetToYaml(
                    item.widget,
                    item.size,
                    entities,
                    updateErrorContext(sectionErrorContext, { path: ["items", i.toString()] }),
                );
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

/** @internal */
export function declarativeWidgetToYaml(
    widget?: IDashboardWidget | null,
    size?: IDashboardLayoutItem["size"],
    entities?: FromEntities,
    errorContext?: IErrorContext,
) {
    if (!widget) {
        return;
    }
    switch (widget?.type) {
        case "insight":
            return declarativeInsightWidgetToYaml(
                widget as IInsightWidget,
                size,
                entities,
                updateErrorContext(errorContext, { path: ["insight"] }),
            );
        case "richText":
            return declarativeRichTextWidgetToYaml(widget as IRichTextWidget, size);
        case "visualizationSwitcher":
            return declarativeVisualizationSwitcherWidgetToYaml(
                widget as IVisualizationSwitcherWidget,
                size,
                entities,
                updateErrorContext(errorContext, { path: ["visualizationSwitcher"] }),
            );
        case "IDashboardLayout":
            return declarativeContainerWidgetToYaml(
                widget as IDashboardLayoutWidget,
                size,
                entities,
                updateErrorContext(errorContext, { path: ["layout"] }),
            );
        default:
            throw newError(CoreErrorCode.ReferenceTypeNotSupported, [String(widget?.type)], errorContext);
    }
}

export function declarativeInsightWidgetToYaml(
    widget: IInsightWidget,
    size?: IDashboardLayoutItem["size"],
    entities?: FromEntities,
    errorContext?: IErrorContext,
) {
    const yamlWidget = new YAMLMap();

    // Local id of widget
    if (widget.localIdentifier) {
        yamlWidget.add(new Pair("id", widget.localIdentifier));
    }

    // The visualization
    yamlWidget.add(
        new Pair(
            "visualization",
            getIdentifier(
                widget.insight,
                true,
                updateErrorContext(errorContext, { path: ["visualisation"] }),
            ),
        ),
    );

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
        yamlWidget.add(
            new Pair(
                "date",
                getIdentifier(widget.dateDataSet, true, updateErrorContext(errorContext, { path: ["date"] })),
            ),
        );
    }
    if (widget.ignoreDashboardFilters?.length) {
        yamlWidget.add(
            new Pair(
                "ignored_filters",
                widget.ignoreDashboardFilters.map((df, i) => {
                    return getIdentifier(
                        dashboardFilterReferenceObjRef(df),
                        undefined,
                        updateErrorContext(errorContext, { path: ["ignoreDashboardFilters", i.toString()] }),
                    );
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
        const sourceVisualizationId = getIdentifier(
            widget.insight,
            true,
            updateErrorContext(errorContext, { path: ["insight"] }),
        );
        widget.drills.forEach((drill, id) => {
            drills.add(
                declarativeDrillToYaml(
                    drill,
                    entities,
                    sourceVisualizationId,
                    updateErrorContext(errorContext, { path: ["drills", id.toString()] }),
                ),
            );
        });
        yamlWidget.add(new Pair("interactions", drills));
    }
    if (widget.ignoredDrillDownHierarchies?.length) {
        const ignores = widget.ignoredDrillDownHierarchies.map((hierarchy, hi) =>
            declarativeIgnoreDrillDownHierarchyToYaml(
                hierarchy,
                updateErrorContext(errorContext, { path: ["ignoredDrillDownHierarchies", hi.toString()] }),
            ),
        );
        yamlWidget.add(new Pair("ignored_drill_downs", ignores));
    }
    if (widget.drillDownIntersectionIgnoredAttributes?.length) {
        const ignores = widget.drillDownIntersectionIgnoredAttributes
            .map((hierarchy, hi) =>
                declarativeDrillDownIntersectionIgnoredAttributesToYaml(
                    hierarchy,
                    updateErrorContext(errorContext, {
                        path: ["drillDownIntersectionIgnoredAttributes", hi.toString()],
                    }),
                ),
            )
            .filter(Boolean);
        yamlWidget.add(new Pair("ignored_drill_downs_intersections", ignores));
    }

    // Cross filtering
    if (widget.ignoreCrossFiltering) {
        yamlWidget.add(new Pair("ignored_cross_filtering", true));
    }

    return yamlWidget;
}

export function declarativeIgnoreDrillDownHierarchyToYaml(
    hierarchy: IDrillDownReference,
    errorContext?: IErrorContext,
) {
    if (isAttributeHierarchyReference(hierarchy)) {
        return {
            hierarchy: hierarchy.attributeHierarchy as unknown as string,
            on: getIdentifier(
                hierarchy.attribute,
                undefined,
                updateErrorContext(errorContext, { path: ["attribute"] }),
            ),
        };
    }

    return {
        template: hierarchy.dateHierarchyTemplate as unknown as string,
        on: getIdentifier(
            hierarchy.dateDatasetAttribute,
            undefined,
            updateErrorContext(errorContext, { path: ["dateDatasetAttribute"] }),
        ),
    };
}

export function declarativeDrillDownIntersectionIgnoredAttributesToYaml(
    hierarchy: IDrillDownIntersectionIgnoredAttributes,
    errorContext?: IErrorContext,
) {
    if (hierarchy.ignoredAttributes.length === 0) {
        return null;
    }
    return {
        attributes: hierarchy.ignoredAttributes,
        hierarchy: declarativeIgnoreDrillDownHierarchyToYaml(
            hierarchy.drillDownReference,
            updateErrorContext(errorContext, { path: ["drillDownReference"] }),
        ),
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
    errorContext?: IErrorContext,
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
            widget.visualizations.map((vis, vi) =>
                declarativeInsightWidgetToYaml(
                    vis,
                    undefined,
                    entities,
                    updateErrorContext(errorContext, { path: ["visualizations", vi.toString()] }),
                ),
            ),
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
    errorContext?: IErrorContext,
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
        widget.sections.forEach((section, si) => {
            const yamlSection = new YAMLMap();

            if (section.header?.title) {
                yamlSection.add(new Pair("title", section.header.title));
            }

            if (section.header?.description) {
                yamlSection.add(new Pair("description", section.header.description));
            }

            if (section.items?.length) {
                const widgets = new YAMLSeq();
                section.items.forEach((item, ii) => {
                    const yamlNestedWidget = declarativeWidgetToYaml(
                        item.widget,
                        item.size,
                        entities,
                        updateErrorContext(errorContext, {
                            path: ["sections", si.toString(), "items", ii.toString()],
                        }),
                    );
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

/** @internal */
export function declarativeDrillToYaml(
    drill: InsightDrillDefinition,
    entities?: FromEntities,
    sourceVisualizationId?: string,
    errorContext?: IErrorContext,
) {
    const drillYaml = new YAMLMap();

    const originIdentifier =
        drill.origin.type === "drillFromMeasure" ? drill.origin.measure : drill.origin.attribute;
    const originPath = drill.origin.type === "drillFromMeasure" ? "measure" : "attribute";

    drillYaml.add(
        new Pair(
            "click_on",
            getIdentifier(
                originIdentifier,
                undefined,
                updateErrorContext(errorContext, { path: ["origin", originPath] }),
            ),
        ),
    );

    if (isDrillToInsight(drill)) {
        drillYaml.add(
            new Pair(
                "open_visualization",
                getIdentifier(drill.target, true, updateErrorContext(errorContext, { path: ["target"] })),
            ),
        );
        const filters = drillFiltersToYaml(drill, entities, sourceVisualizationId, errorContext);
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
        drillYaml.add(
            new Pair(
                "open_dashboard",
                getIdentifier(drill.target, true, updateErrorContext(errorContext, { path: ["target"] })),
            ),
        );
        if (drill.targetTabLocalIdentifier) {
            drillYaml.add(new Pair("open_dashboard_tab", drill.targetTabLocalIdentifier));
        }
        const filters = drillFiltersToYaml(dashboardDrill, entities, sourceVisualizationId, errorContext);
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
                label: getIdentifier(
                    drill.target.displayForm,
                    undefined,
                    updateErrorContext(errorContext, { path: ["target", "displayForm"] }),
                ),
                href: getIdentifier(
                    drill.target.hyperlinkDisplayForm,
                    undefined,
                    updateErrorContext(errorContext, { path: ["target", "hyperlinkDisplayForm"] }),
                ),
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
    errorContext?: IErrorContext,
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
                filterRefsToYaml(
                    drill.includedSourceInsightFiltersObjRefs,
                    entities,
                    sourceVisualizationId,
                    updateErrorContext(errorContext, { path: ["includedSourceInsightFiltersObjRefs"] }),
                ),
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
                    updateErrorContext(errorContext, { path: ["includedSourceMeasureFiltersObjRefs"] }),
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
    errorContext?: IErrorContext,
): string[] {
    const visualisation = entities?.find(
        (entity) => VisualisationsTypes.includes(entity.type) && entity.id === sourceVisualizationId,
    )?.data as Visualisation | undefined;
    const filters = visualisation?.query?.filter_by;

    return refs
        .map(
            (ref) =>
                findSourceInsightFilterId(filters, ref, errorContext) ??
                sourceInsightFilterRefFallbackId(ref, errorContext),
        )
        .filter(Boolean) as string[];
}

function findSourceInsightFilterId(
    filters: NonNullable<Visualisation["query"]>["filter_by"] | undefined,
    ref: { type: string; [key: string]: any },
    errorContext?: IErrorContext,
): string | undefined {
    if (!filters) {
        return undefined;
    }

    return Object.entries(filters).find(([_, filter]) =>
        matchesSourceInsightFilterRef(filter, ref, errorContext),
    )?.[0];
}

function matchesSourceInsightFilterRef(
    filter: Filter,
    ref: { type: string; [key: string]: any },
    errorContext?: IErrorContext,
) {
    switch (ref.type) {
        case "attributeFilter":
            return (
                filter.type === "attribute_filter" &&
                filter.using ===
                    getIdentifier(
                        ref["label"],
                        undefined,
                        updateErrorContext(errorContext, { path: ["attributeFilter"] }),
                    )
            );
        case "dateFilter":
            return (
                filter.type === "date_filter" &&
                filter.using ===
                    getIdentifier(
                        ref["dataSet"],
                        true,
                        updateErrorContext(errorContext, { path: ["dateFilter"] }),
                    )
            );
        case "measureValueFilter":
            return (
                filter.type === "metric_value_filter" &&
                filter.using ===
                    getIdentifier(
                        ref["measure"],
                        undefined,
                        updateErrorContext(errorContext, { path: ["measureValueFilter"] }),
                    )
            );
        case "rankingFilter":
            return (
                filter.type === "ranking_filter" &&
                filter.using ===
                    getIdentifier(
                        ref["measure"],
                        undefined,
                        updateErrorContext(errorContext, { path: ["rankingFilter"] }),
                    )
            );
        default:
            return false;
    }
}

function sourceInsightFilterRefFallbackId(
    ref: { type: string; [key: string]: any },
    errorContext?: IErrorContext,
): string | null {
    switch (ref.type) {
        case "attributeFilter":
            return getIdentifier(
                ref["label"],
                undefined,
                updateErrorContext(errorContext, { path: ["attributeFilter"] }),
            );
        case "dateFilter":
            return getIdentifier(
                ref["dataSet"],
                true,
                updateErrorContext(errorContext, { path: ["dateFilter"] }),
            );
        case "measureValueFilter":
            return getIdentifier(
                ref["measure"],
                undefined,
                updateErrorContext(errorContext, { path: ["measureValueFilter"] }),
            );
        case "rankingFilter":
            return getIdentifier(
                ref["measure"],
                undefined,
                updateErrorContext(errorContext, { path: ["rankingFilter"] }),
            );
        default:
            return null;
    }
}

function sourceMeasureFilterRefsToYaml(
    refs: Array<{ type: string; [key: string]: any }>,
    entities?: FromEntities,
    sourceVisualizationId?: string,
    errorContext?: IErrorContext,
): string[] {
    const visualisation = entities?.find(
        (entity) => VisualisationsTypes.includes(entity.type) && entity.id === sourceVisualizationId,
    )?.data as Visualisation | undefined;
    const fieldFilters = collectFieldLevelFilters(visualisation);

    return refs
        .map(
            (ref) =>
                findSourceInsightFilterId(fieldFilters, ref, errorContext) ??
                sourceInsightFilterRefFallbackId(ref, errorContext),
        )
        .filter(Boolean) as string[];
}

/** @internal */
export type FilterContextItem = { yaml: YAMLMap; filter: IFilterContextDefinition["filters"][number] };
type EmptyValueHandling = NonNullable<IDashboardDateFilter["dateFilter"]["emptyValueHandling"]>;

function getDateFilterEmptyValueHandling(filter: IDashboardDateFilter): EmptyValueHandling | undefined {
    const value = filter.dateFilter.emptyValueHandling;
    if (value === "include" || value === "exclude" || value === "only") {
        return value;
    }
    return undefined;
}

/** @internal */
export function declarativeFilterContextToYaml(
    dateFilterConfig?: IDashboardDateFilterConfig,
    filterContext?: DeclarativeFilterContext,
    errorContext?: IErrorContext,
) {
    const filters: Array<Pair> = [];
    const filtersMap: { [key: string]: FilterContextItem } = {};
    const content = filterContext ? (filterContext.content as IFilterContextDefinition) : undefined;

    const declarativeFilters = content?.filters ?? [];

    declarativeFilters.forEach((filter) => {
        if (isDashboardDateFilter(filter) && isNoopAllTimeDashboardDateFilter(filter)) {
            return;
        }

        const key = createFilterContextItemKeyName(
            filter,
            "date",
            updateErrorContext(errorContext, { path: ["date"] }),
        );
        if (isDashboardDateFilter(filter)) {
            const def = declarativeDateFilterToYaml(filter, errorContext);
            filters.push(new Pair(key, def));
            filtersMap[key] = {
                yaml: def,
                filter: filter as IFilterContextDefinition["filters"][number],
            };
        }
        if (isDashboardAttributeFilter(filter)) {
            const def = declarativeAttributeFilterToYaml(filter, errorContext);
            filters.push(new Pair(key, def));
            filtersMap[key] = {
                yaml: def,
                filter: filter as IFilterContextDefinition["filters"][number],
            };
        }
        if (isDashboardArbitraryAttributeFilter(filter)) {
            const def = declarativeArbitraryTextFilterToYaml(filter, errorContext);
            filters.push(new Pair(key, def));
            filtersMap[key] = {
                yaml: def,
                filter: filter as IFilterContextDefinition["filters"][number],
            };
        }
        if (isDashboardMatchAttributeFilter(filter)) {
            const def = declarativeMatchTextFilterToYaml(filter, errorContext);
            filters.push(new Pair(key, def));
            filtersMap[key] = {
                yaml: def,
                filter: filter as IFilterContextDefinition["filters"][number],
            };
        }
        if (isDashboardMeasureValueFilter(filter)) {
            const def = declarativeMeasureValueFilterToYaml(filter, errorContext);
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
        const key = createFilterContextItemKeyName(
            filter,
            "common",
            updateErrorContext(errorContext, { path: ["common"] }),
        );
        const def = declarativeDateFilterToYaml(filter, errorContext);

        filters.unshift(new Pair(key, def));
        filtersMap[key] = {
            yaml: def,
            filter: filter as IFilterContextDefinition["filters"][number],
        };
    }

    Object.values(filtersMap).forEach(({ filter, yaml }) => {
        if (isDashboardAttributeFilter(filter) || isDashboardArbitraryAttributeFilter(filter)) {
            const filterBody = isDashboardAttributeFilter(filter)
                ? filter.attributeFilter
                : filter.arbitraryAttributeFilter;
            //parents attribute filters
            const attrsIds = filterBody.filterElementsBy
                ?.map((element) => {
                    return element.filterLocalIdentifier ?? null;
                })
                .filter(Boolean);

            //parents date filters
            const datesIds = filterBody.filterElementsByDate
                ?.map((element) => {
                    if (!element.isCommonDate && element.filterLocalIdentifier) {
                        return {
                            using: element.filterLocalIdentifier,
                            common: element.isCommonDate,
                        };
                    }
                    // Common date: emit the target dimension so it round-trips. The common date filter
                    // has no dimension of its own, so resolution needs it carried explicitly. Legacy
                    // records without a dataSet fall back to the bare-string form, where
                    // filterLocalIdentifier already holds the dataset id.
                    if (element.isCommonDate && element.dataSet) {
                        return {
                            using: element.filterLocalIdentifier,
                            common: true,
                            date: getIdentifier(element.dataSet, true, errorContext),
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
            const metricsIds = filterBody.validateElementsBy
                ?.map((element, i) =>
                    getIdentifier(
                        element,
                        undefined,
                        updateErrorContext(errorContext, { path: ["validateElementsBy", i.toString()] }),
                    ),
                )
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

function declarativeDateFilterToYaml(filter: IDashboardDateFilter, errorContext?: IErrorContext) {
    const dateFilter = new YAMLMap();

    dateFilter.add(new Pair("type", "date_filter"));

    const gran = parseGranularity(filter.dateFilter.granularity);
    if (gran !== "DAY") {
        dateFilter.add(new Pair("granularity", gran));
    }

    if (filter.dateFilter.dataSet) {
        dateFilter.add(
            new Pair(
                "date",
                getIdentifier(
                    filter.dateFilter.dataSet,
                    true,
                    updateErrorContext(errorContext, { path: ["date"] }),
                ),
            ),
        );
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

function declarativeAttributeFilterToYaml(filter: IDashboardAttributeFilter, errorContext?: IErrorContext) {
    const attributeFilter = new YAMLMap();

    attributeFilter.add(new Pair("type", "attribute_filter"));
    if (filter.attributeFilter.title) {
        attributeFilter.add(new Pair("title", filter.attributeFilter.title));
    }

    const attributeId = getIdentifier(
        filter.attributeFilter.displayForm,
        undefined,
        updateErrorContext(errorContext, { path: ["attributeFilter", "displayForm"] }),
    );
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

function declarativeArbitraryTextFilterToYaml(
    filter: IDashboardArbitraryAttributeFilter,
    errorContext?: IErrorContext,
) {
    const textFilter = new YAMLMap();

    textFilter.add(new Pair("type", "text_filter"));
    if (filter.arbitraryAttributeFilter.title) {
        textFilter.add(new Pair("title", filter.arbitraryAttributeFilter.title));
    }
    textFilter.add(
        new Pair(
            "using",
            getIdentifier(
                filter.arbitraryAttributeFilter.displayForm,
                undefined,
                updateErrorContext(errorContext, { path: ["arbitraryAttributeFilter", "displayForm"] }),
            ),
        ),
    );
    textFilter.add(new Pair("condition", filter.arbitraryAttributeFilter.negativeSelection ? "isNot" : "is"));
    textFilter.add(new Pair("values", filter.arbitraryAttributeFilter.values));

    return textFilter;
}

function declarativeMatchTextFilterToYaml(
    filter: IDashboardMatchAttributeFilter,
    errorContext?: IErrorContext,
) {
    const textFilter = new YAMLMap();

    textFilter.add(new Pair("type", "text_filter"));
    if (filter.matchAttributeFilter.title) {
        textFilter.add(new Pair("title", filter.matchAttributeFilter.title));
    }
    textFilter.add(
        new Pair(
            "using",
            getIdentifier(
                filter.matchAttributeFilter.displayForm,
                undefined,
                updateErrorContext(errorContext, { path: ["matchAttributeFilter", "displayForm"] }),
            ),
        ),
    );
    textFilter.add(
        new Pair(
            "condition",
            matchConditionToYaml(
                filter.matchAttributeFilter.operator,
                filter.matchAttributeFilter.negativeSelection,
            ),
        ),
    );
    textFilter.add(new Pair("value", filter.matchAttributeFilter.literal));
    if (filter.matchAttributeFilter.caseSensitive !== undefined) {
        textFilter.add(new Pair("case_sensitive", filter.matchAttributeFilter.caseSensitive));
    }

    return textFilter;
}

function measureValueConditionToYaml(condition: MeasureValueFilterCondition): YAMLMap {
    const yamlCondition = new YAMLMap();
    if (isComparisonCondition(condition)) {
        yamlCondition.add(new Pair("condition", condition.comparison.operator));
        yamlCondition.add(new Pair("value", condition.comparison.value));
    } else if (isRangeCondition(condition)) {
        yamlCondition.add(new Pair("condition", condition.range.operator));
        yamlCondition.add(new Pair("from", condition.range.from));
        yamlCondition.add(new Pair("to", condition.range.to));
    }
    return yamlCondition;
}

function conditionHasTreatNullValuesAs(condition: MeasureValueFilterCondition): boolean {
    if (isComparisonCondition(condition)) {
        return condition.comparison.treatNullValuesAs !== undefined;
    }
    if (isRangeCondition(condition)) {
        return condition.range.treatNullValuesAs !== undefined;
    }
    return false;
}

function declarativeMeasureValueFilterToYaml(
    filter: IDashboardMeasureValueFilter,
    errorContext?: IErrorContext,
) {
    const measureValueFilter = new YAMLMap();

    measureValueFilter.add(new Pair("type", "metric_value_filter"));
    if (filter.dashboardMeasureValueFilter.title) {
        measureValueFilter.add(new Pair("title", filter.dashboardMeasureValueFilter.title));
    }
    measureValueFilter.add(
        new Pair(
            "using",
            getIdentifier(
                filter.dashboardMeasureValueFilter.measure,
                undefined,
                updateErrorContext(errorContext, { path: ["dashboardMeasureValueFilter", "measure"] }),
            ),
        ),
    );

    const conditions = filter.dashboardMeasureValueFilter.conditions ?? [];
    if (conditions.length > 0) {
        const conditionsSeq = new YAMLSeq();
        conditions.forEach((c) => conditionsSeq.add(measureValueConditionToYaml(c)));
        measureValueFilter.add(new Pair("conditions", conditionsSeq));
    }

    if (filter.dashboardMeasureValueFilter.dimensionality?.length) {
        const dimensionalitySeq = new YAMLSeq();
        filter.dashboardMeasureValueFilter.dimensionality.forEach((item, i) => {
            dimensionalitySeq.add(
                getIdentifier(
                    item,
                    undefined,
                    updateErrorContext(errorContext, {
                        path: ["dashboardMeasureValueFilter", "dimensionality", i.toString()],
                    }),
                ),
            );
        });
        measureValueFilter.add(new Pair("dimensionality", dimensionalitySeq));
    }

    // Aggregate per-condition `treatNullValuesAs` into a single top-level YAML flag
    // (mirrors the insight MVF YAML representation).
    const treatNullValuesAsZero = conditions.some(conditionHasTreatNullValuesAs);
    if (treatNullValuesAsZero) {
        measureValueFilter.add(new Pair("null_values_as_zero", true));
    }

    return measureValueFilter;
}

/** @internal */
export function declarativeFiltersConfigToYaml(
    filtersMap: Record<string, FilterContextItem>,
    dateFilterConfig?: IDashboardDateFilterConfig,
    dateFilterConfigs?: IDashboardDateFilterConfigItem[],
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
    measureValueFilterConfigs?: IDashboardMeasureValueFilterConfig[],
    errorContext?: IErrorContext,
) {
    attributeFilterConfigs?.forEach((filterSettings, i) => {
        const filter = filtersMap[filterSettings.localIdentifier];
        if (filter) {
            if (filterSettings.mode && filterSettings.mode !== "active") {
                filter.yaml.add(new Pair("mode", filterSettings.mode));
            }
            if (filterSettings.displayAsLabel) {
                filter.yaml.add(
                    new Pair(
                        "display_as",
                        getIdentifier(
                            filterSettings.displayAsLabel,
                            undefined,
                            updateErrorContext(errorContext, {
                                path: ["attributeFilterConfig", i.toString(), "displayAsLabel"],
                            }),
                        ),
                    ),
                );
            }
            if (filterSettings.selectionType) {
                filter.yaml.add(new Pair("selection_type", filterSettings.selectionType));
            }
        }
    });
    dateFilterConfigs?.forEach((filterSettings, i) => {
        const filter = Object.values(filtersMap).find(
            (filter) =>
                filter.yaml.get("date") ===
                getIdentifier(
                    filterSettings.dateDataSet,
                    true,
                    updateErrorContext(errorContext, {
                        path: ["dateFilterConfig", i.toString(), "dateDataSet"],
                    }),
                ),
        );
        fillDateFilterConfig(filterSettings.config, filter);
    });
    if (dateFilterConfig) {
        const filter = Object.values(filtersMap).find(
            (filter) => filter.yaml.get("type") === "date_filter" && !filter.yaml.get("date"),
        );

        fillDateFilterConfig(dateFilterConfig, filter);
    }
    measureValueFilterConfigs?.forEach((filterSettings) => {
        const filter = filtersMap[filterSettings.localIdentifier];
        if (filter && filterSettings.mode && filterSettings.mode !== "active") {
            filter.yaml.add(new Pair("mode", filterSettings.mode));
        }
    });
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

/** @internal */
export function declarativePluginsToYaml(dashboard: IDashboardDefinition, errorContext?: IErrorContext) {
    if (!dashboard.plugins?.length) {
        return;
    }

    const plugins = new YAMLSeq();

    dashboard.plugins.forEach((plugin, i) => {
        const pluginId = getIdentifier(
            plugin.plugin,
            true,
            updateErrorContext(errorContext, { path: [i.toString(), "plugin"] }),
        );
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
