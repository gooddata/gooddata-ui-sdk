// (C) 2020-2024 GoodData Corporation
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
    isDashboardLayout,
} from "@gooddata/sdk-model";
import omit from "lodash/omit.js";
import { cloneWithSanitizedIds } from "./IdSanitization.js";
import update from "lodash/fp/update.js";
import { convertLayout } from "../shared/layoutConverter.js";
import { v4 as uuidv4 } from "uuid";

function removeIdentifiers(widget: IDashboardWidget, useWidgetLocalIdentifiers?: boolean) {
    /**
     * We want to keep localIdentifier which is the only widget identity stored on backend.
     * If it is nonexistent, we create a new one.
     */
    const localIdentifierObj =
        useWidgetLocalIdentifiers && !isDashboardLayout(widget)
            ? { localIdentifier: widget.localIdentifier ?? uuidv4() }
            : {};
    const updatedWidget = {
        ...widget,
        ...localIdentifierObj,
    };

    return omit(updatedWidget, ["ref", "uri", "identifier"]);
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
        version: "2",
    };
}

export function convertFilterContextToBackend(
    filterContext: IFilterContextDefinition,
): AnalyticalDashboardModelV2.IFilterContext {
    return {
        filters: cloneWithSanitizedIds(filterContext.filters),
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
