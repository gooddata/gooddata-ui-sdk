// (C) 2020-2022 GoodData Corporation
import { AnalyticalDashboardModelV2 } from "@gooddata/api-client-tiger";
import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    IFilterContextDefinition,
    IDrillToCustomUrl,
    isDrillToCustomUrl,
    isInsightWidgetDefinition,
    isInsightWidget,
    IDashboardLayout,
    IDashboardWidget,
    IDashboardDefinition,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
} from "@gooddata/sdk-model";
import omit from "lodash/omit.js";
import { cloneWithSanitizedIds } from "./IdSanitization.js";
import isEmpty from "lodash/isEmpty.js";
import update from "lodash/fp/update.js";
import { splitDrillUrlParts } from "@gooddata/sdk-model/internal";

function removeIdentifiers(widget: IDashboardWidget) {
    return omit(widget, ["ref", "uri", "identifier"]);
}

function removeWidgetIdentifiersInLayout(layout: IDashboardLayout<IDashboardWidget> | undefined) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((newLayout, widgetPath) => {
        return update(widgetPath, removeIdentifiers, newLayout);
    }, layout);
}

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
    filterContextRef?: ObjRef,
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    const layout = convertDrillToCustomUrlInLayoutToBackend(
        removeWidgetIdentifiersInLayout(dashboard.layout),
    );

    return {
        dateFilterConfig: cloneWithSanitizedIds(dashboard.dateFilterConfig),
        filterContextRef: cloneWithSanitizedIds(filterContextRef),
        layout: cloneWithSanitizedIds(layout),
        plugins: dashboard.plugins?.map(convertDashboardPluginLinkToBackend),
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

function convertTargetUrlToParts(drill: IDrillToCustomUrl) {
    return update(["target", "url"], splitDrillUrlParts, drill);
}

export function convertDrillToCustomUrlInLayoutToBackend(layout?: IDashboardLayout) {
    if (!layout) {
        return;
    }

    const paths = getDrillToCustomUrlPaths(layout);
    if (isEmpty(paths)) {
        return layout;
    }

    return paths.reduce((layout: IDashboardLayout, path: LayoutPath) => {
        return update(path, convertTargetUrlToParts, layout);
    }, layout);
}
