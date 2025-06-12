// (C) 2020-2025 GoodData Corporation
import { AnalyticalDashboardModelV2 } from "@gooddata/api-client-tiger";
import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    IFilterContextDefinition,
    isDrillToCustomUrl,
    isInsightWidgetDefinition,
    isInsightWidget,
    IDashboardLayout,
    IDashboardWidget,
    IDashboardDefinition,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    isVisualizationSwitcherWidget,
    isVisualizationSwitcherWidgetDefinition,
    IInsightWidget,
    isDashboardLayout,
} from "@gooddata/sdk-model";
import omit from "lodash/omit.js";
import { cloneWithSanitizedIds } from "./IdSanitization.js";
import update from "lodash/fp/update.js";
import { convertLayout } from "../shared/layoutConverter.js";
import { generateWidgetLocalIdentifier } from "../../utils/widgetLocalIdentifier.js";
import { addFilterLocalIdentifier } from "../../utils/filterLocalidentifier.js";

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
        return update(
            widgetPath,
            (widget) => removeIdentifiers(widget, useWidgetLocalIdentifiers),
            newLayout,
        );
    }, layout);
}

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
    filterContextRef?: ObjRef,
    useWidgetLocalIdentifiers?: boolean,
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    const layout = convertLayout(
        false,
        removeWidgetIdentifiersInLayout(dashboard.layout, useWidgetLocalIdentifiers),
    );

    return {
        dateFilterConfig: cloneWithSanitizedIds(dashboard.dateFilterConfig),
        dateFilterConfigs: cloneWithSanitizedIds(dashboard.dateFilterConfigs),
        attributeFilterConfigs: cloneWithSanitizedIds(dashboard.attributeFilterConfigs),
        filterContextRef: cloneWithSanitizedIds(filterContextRef),
        layout: cloneWithSanitizedIds(layout),
        plugins: dashboard.plugins?.map(convertDashboardPluginLinkToBackend),
        disableCrossFiltering: dashboard.disableCrossFiltering,
        disableUserFilterReset: dashboard.disableUserFilterReset,
        disableUserFilterSave: dashboard.disableUserFilterSave,
        disableFilterViews: dashboard.disableFilterViews,
        evaluationFrequency: dashboard.evaluationFrequency,
        version: "2",
    };
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
