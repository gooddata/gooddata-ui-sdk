// (C) 2019-2020 GoodData Corporation

import {
    GdcMetadata,
    GdcDashboard,
    GdcFilterContext,
    GdcVisualizationWidget,
    GdcKpi,
    GdcVisualizationObject,
    GdcExtendedDateFilters,
    GdcVisualizationClass,
} from "@gooddata/gd-bear-model";
import { uriRef } from "@gooddata/sdk-model";
import keyBy from "lodash/keyBy";
import {
    IListedDashboard,
    IDashboard,
    IFilterContext,
    IDateFilterConfig,
    IDashboardAddedPresets,
    ITempFilterContext,
    isWidget,
} from "@gooddata/sdk-backend-spi";
import { sanitizeExportFilterContext, convertFilterContext, convertTempFilterContext } from "./filterContext";
import { convertLayout, createImplicitDashboardLayout } from "./layout";
import { DashboardDependency, BearDashboardDependency } from "./types";
import { convertVisualizationWidget, convertKpi } from "./widget";

export const convertListedDashboard = (dashboardLink: GdcMetadata.IObjectLink): IListedDashboard => ({
    ref: uriRef(dashboardLink.link),
    identifier: dashboardLink.identifier!,
    uri: dashboardLink.link,
    title: dashboardLink.title!,
    description: dashboardLink.summary!,
    updated: dashboardLink.updated!,
    created: dashboardLink.created!,
});

const convertDateFilterConfigAddedPresets = (
    addPresets: GdcExtendedDateFilters.IDashboardAddedPresets,
): IDashboardAddedPresets => {
    const { absolutePresets = [], relativePresets = [] } = addPresets;
    const convertedPresets: IDashboardAddedPresets = {
        absolutePresets: absolutePresets.map(preset => ({ ...preset, type: "absolutePreset" })),
        relativePresets: relativePresets.map(preset => ({ ...preset, type: "relativePreset" })),
    };
    return convertedPresets;
};

export const convertDateFilterConfig = (
    dateFilterConfig: GdcExtendedDateFilters.IDashboardDateFilterConfig,
): IDateFilterConfig => {
    const { filterName, mode, addPresets, hideGranularities, hideOptions } = dateFilterConfig;

    return {
        filterName,
        mode,
        addPresets: addPresets && convertDateFilterConfigAddedPresets(addPresets),
        hideGranularities,
        hideOptions,
    };
};

export const convertDashboard = (
    dashboard: GdcDashboard.IWrappedAnalyticalDashboard,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[] = [],
    exportFilterContextUri?: string,
): IDashboard => {
    const {
        meta: { summary, created, updated, identifier, uri, title },
        content: { layout, filterContext, dateFilterConfig, widgets: widgetsUris },
    } = dashboard.analyticalDashboard;

    const sdkDependencies = dependencies
        // Filter out visualization objects - we only need them to create implicit layout
        .filter(d => !GdcVisualizationObject.isVisualization(d))
        .map(convertDashboardDependency);
    const unsortedWidgets = sdkDependencies.filter(isWidget);

    // To preserve the logic of createImplicitDashboardLayout, we must preserve the order of the widgets
    const widgetByUri = keyBy(unsortedWidgets, "uri");
    const widgets = widgetsUris.map(widgetUri => widgetByUri[widgetUri]);

    const filterContextOrExportFilterContext = sdkDependencies.find(dep =>
        exportFilterContextUri ? dep.uri === exportFilterContextUri : dep.uri === filterContext,
    ) as IFilterContext | ITempFilterContext | undefined;

    const convertedDashboard: IDashboard = {
        title,
        description: summary,

        identifier,
        uri,
        ref: uriRef(uri),

        created: created!,
        updated: updated!,

        dateFilterConfig: dateFilterConfig && convertDateFilterConfig(dateFilterConfig),

        filterContext:
            exportFilterContextUri && filterContextOrExportFilterContext
                ? sanitizeExportFilterContext(filterContextOrExportFilterContext)
                : filterContextOrExportFilterContext,
        layout: layout
            ? convertLayout(layout, widgets)
            : createImplicitDashboardLayout(widgets, dependencies, visualizationClasses),
    };

    return convertedDashboard;
};

const convertDashboardDependency = (dependency: BearDashboardDependency): DashboardDependency => {
    if (GdcVisualizationWidget.isWrappedVisualizationWidget(dependency)) {
        return convertVisualizationWidget(dependency);
    } else if (GdcKpi.isWrappedKpi(dependency)) {
        return convertKpi(dependency);
    } else if (GdcFilterContext.isWrappedFilterContext(dependency)) {
        return convertFilterContext(dependency) as IFilterContext;
    } else if (GdcFilterContext.isWrappedTempFilterContext(dependency)) {
        return convertTempFilterContext(dependency);
    }

    throw new Error(`No converter for the dashboard dependency!`);
};
