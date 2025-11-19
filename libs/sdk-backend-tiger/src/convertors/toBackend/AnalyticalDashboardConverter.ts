// (C) 2020-2025 GoodData Corporation

import { cloneDeep, omit, update } from "lodash-es";

import { AnalyticalDashboardModelV2 } from "@gooddata/api-client-tiger";
import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    IDashboardDefinition,
    IDashboardLayout,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    IDashboardTab,
    IDashboardWidget,
    IFilterContextDefinition,
    IInsightWidget,
    ObjRef,
    isDashboardLayout,
    isDrillToCustomUrl,
    isInsightWidget,
    isInsightWidgetDefinition,
    isVisualizationSwitcherWidget,
    isVisualizationSwitcherWidgetDefinition,
} from "@gooddata/sdk-model";

import { cloneWithSanitizedIds } from "./IdSanitization.js";
import { addFilterLocalIdentifier } from "../../utils/filterLocalidentifier.js";
import { generateWidgetLocalIdentifier } from "../../utils/widgetLocalIdentifier.js";
import { convertLayout } from "../shared/layoutConverter.js";

function removeIdentifiers(widget: IDashboardWidget, useWidgetLocalIdentifiers?: boolean): IDashboardWidget {
    /**
     * We want to keep localIdentifier which is the only widget identity stored on backend.
     * If it is nonexistent, we create a new one.
     */
    const localIdentifierObj = useWidgetLocalIdentifiers
        ? { localIdentifier: widget.localIdentifier ?? generateWidgetLocalIdentifier() }
        : {};

    let updatedWidget: IDashboardWidget;

    if (isDashboardLayout(widget)) {
        updatedWidget = {
            ...widget,
            ...localIdentifierObj,
            ...removeWidgetIdentifiersInLayout(widget, useWidgetLocalIdentifiers),
        };
    } else {
        updatedWidget = {
            ...widget,
            ...localIdentifierObj,
            // check both types as widget during save as new is already stripped from ref and uri
            ...(isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)
                ? {
                      visualizations: widget.visualizations.map(
                          (visualization) =>
                              removeIdentifiers(visualization, useWidgetLocalIdentifiers) as IInsightWidget,
                      ),
                  }
                : {}),
        };
    }

    // omit removes mandatory props, but we do not have type for such stripped widget
    return omit(updatedWidget, ["ref", "uri", "identifier"]) as IDashboardWidget;
}

function removeWidgetIdentifiersInLayout(
    layout: IDashboardLayout<IDashboardWidget> | undefined,
    useWidgetLocalIdentifiers?: boolean,
) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((newLayout, widgetPath) => {
        const layoutCopy = cloneDeep(newLayout);
        update(layoutCopy, widgetPath, (widget) => removeIdentifiers(widget, useWidgetLocalIdentifiers));
        return layoutCopy;
    }, layout);
}

function convertDashboardTabToBackend(
    tab: IDashboardTab,
    filterContextRef?: ObjRef,
    useWidgetLocalIdentifiers?: boolean,
): AnalyticalDashboardModelV2.IDashboardTab {
    const layout = convertLayout(
        false,
        removeWidgetIdentifiersInLayout(tab.layout, useWidgetLocalIdentifiers),
    );

    return {
        localIdentifier: tab.localIdentifier,
        title: tab.title,
        layout: cloneWithSanitizedIds(layout),
        filterContextRef: cloneWithSanitizedIds(filterContextRef)!,
        dateFilterConfig: cloneWithSanitizedIds(tab.dateFilterConfig),
        dateFilterConfigs: cloneWithSanitizedIds(tab.dateFilterConfigs),
        attributeFilterConfigs: cloneWithSanitizedIds(tab.attributeFilterConfigs),
    };
}

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
    filterContextRef?: ObjRef,
    useWidgetLocalIdentifiers?: boolean,
    enableDashboardSectionHeadersDateDataSet?: boolean,
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    // For backward compatibility, if dashboard has tabs, fill root-level properties
    // with active/first tab's content so older SDK versions can still read the dashboard
    let effectiveLayout = dashboard.layout;
    let effectiveDateFilterConfig = dashboard.dateFilterConfig;
    let effectiveDateFilterConfigs = dashboard.dateFilterConfigs;
    let effectiveAttributeFilterConfigs = dashboard.attributeFilterConfigs;

    if (dashboard.tabs && dashboard.tabs.length > 0) {
        const activeTab = dashboard.activeTabLocalIdentifier
            ? dashboard.tabs.find((tab) => tab.localIdentifier === dashboard.activeTabLocalIdentifier)
            : undefined;
        const effectiveTab = activeTab ?? dashboard.tabs[0];

        // Use tab's properties for root-level (backward compatibility)
        effectiveLayout = effectiveTab.layout;
        effectiveDateFilterConfig = effectiveTab.dateFilterConfig;
        effectiveDateFilterConfigs = effectiveTab.dateFilterConfigs;
        effectiveAttributeFilterConfigs = effectiveTab.attributeFilterConfigs;
    }

    const layout = convertLayout(
        false,
        removeWidgetIdentifiersInLayout(effectiveLayout, useWidgetLocalIdentifiers),
    );

    const result: AnalyticalDashboardModelV2.IAnalyticalDashboard = {
        dateFilterConfig: cloneWithSanitizedIds(effectiveDateFilterConfig),
        dateFilterConfigs: cloneWithSanitizedIds(effectiveDateFilterConfigs),
        attributeFilterConfigs: cloneWithSanitizedIds(effectiveAttributeFilterConfigs),
        filterContextRef: cloneWithSanitizedIds(filterContextRef),
        layout: cloneWithSanitizedIds(layout),
        plugins: dashboard.plugins?.map(convertDashboardPluginLinkToBackend),
        disableCrossFiltering: dashboard.disableCrossFiltering,
        disableUserFilterReset: dashboard.disableUserFilterReset,
        disableUserFilterSave: dashboard.disableUserFilterSave,
        disableFilterViews: dashboard.disableFilterViews,
        evaluationFrequency: dashboard.evaluationFrequency,
        tabs: dashboard.tabs?.map((tab) =>
            convertDashboardTabToBackend(tab, tab.filterContext?.ref, useWidgetLocalIdentifiers),
        ),
        activeTabLocalIdentifier: dashboard.activeTabLocalIdentifier,
        version: "2",
    };

    if (enableDashboardSectionHeadersDateDataSet) {
        result.sectionHeadersDateDataSet = cloneWithSanitizedIds(dashboard.sectionHeadersDateDataSet);
    }

    return result;
}

export function convertFilterContextToBackend(
    filterContext: IFilterContextDefinition,
    useDateFilterLocalIdentifiers?: boolean,
): AnalyticalDashboardModelV2.IFilterContext {
    const updatedFilters = useDateFilterLocalIdentifiers
        ? filterContext.filters.map((filter, index) => addFilterLocalIdentifier(filter, index))
        : filterContext.filters;

    return {
        filters: cloneWithSanitizedIds(updatedFilters),
        version: "2",
    };
}

export function convertDashboardPluginToBackend(
    plugin: IDashboardPluginDefinition,
): AnalyticalDashboardModelV2.IDashboardPlugin {
    return {
        url: plugin.url,
        version: "2",
    };
}

export function convertDashboardPluginLinkToBackend(
    pluginLink: IDashboardPluginLink,
): AnalyticalDashboardModelV2.IDashboardPluginLink {
    return {
        plugin: cloneWithSanitizedIds(pluginLink.plugin),
        parameters: pluginLink.parameters,
        version: "2",
    };
}

export function getDrillToCustomUrlPaths(layout: IDashboardLayout) {
    const paths: LayoutPath[] = [];

    walkLayout(layout, {
        widgetCallback: (widget, widgetPath) => {
            if (!isInsightWidget(widget) && !isInsightWidgetDefinition(widget)) {
                return;
            }

            widget.drills.forEach((drill, drillIndex) => {
                if (!isDrillToCustomUrl(drill)) {
                    return;
                }

                paths.push([...widgetPath, "drills", drillIndex]);
            });
        },
    });

    return paths;
}
