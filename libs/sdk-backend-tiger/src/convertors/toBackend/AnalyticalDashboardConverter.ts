// (C) 2020-2021 GoodData Corporation
import { AnalyticalDashboardModelV2 } from "@gooddata/api-client-tiger";
import {
    IDashboardDefinition,
    IDashboardLayout,
    IDashboardPluginDefinition,
    IDashboardPluginLink,
    IDashboardWidget,
    IFilterContextDefinition,
    LayoutPath,
    walkLayout,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import omit from "lodash/omit";
import updateWith from "lodash/updateWith";
import { cloneWithSanitizedIds } from "./IdSanitization";

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

    return widgetsPaths.reduce((layout, widgetPath) => {
        return updateWith(layout, widgetPath, removeIdentifiers);
    }, layout);
}

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
    filterContextRef?: ObjRef,
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    const layout = removeWidgetIdentifiersInLayout(dashboard.layout);

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
