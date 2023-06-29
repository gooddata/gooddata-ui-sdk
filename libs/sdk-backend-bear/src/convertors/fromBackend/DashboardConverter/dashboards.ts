// (C) 2019-2022 GoodData Corporation

import {
    GdcMetadata,
    GdcDashboard,
    GdcFilterContext,
    GdcVisualizationWidget,
    GdcKpi,
    GdcVisualizationObject,
    GdcVisualizationClass,
} from "@gooddata/api-model-bear";
import {
    IUser,
    uriRef,
    IFilterContext,
    ITempFilterContext,
    isWidget,
    IDashboard,
    IListedDashboard,
    ListedDashboardAvailability,
    IDashboardDateFilterConfig,
    IDashboardDateFilterAddedPresets,
    IDashboardPluginLink,
    ShareStatus,
} from "@gooddata/sdk-model";
import keyBy from "lodash/keyBy.js";
import {
    sanitizeExportFilterContext,
    convertFilterContext,
    convertTempFilterContext,
} from "./filterContext.js";
import { convertLayout, createImplicitDashboardLayout } from "./layout.js";
import { DashboardDependency, BearDashboardDependency } from "./types.js";
import { convertVisualizationWidget, convertKpi } from "./widget.js";

export const convertListedDashboard = (
    dashboardLink: GdcMetadata.IObjectLink,
    availability: ListedDashboardAvailability,
    userMap?: Map<string, IUser>,
): IListedDashboard => {
    const isUnderStrictControlProp = dashboardLink.flags?.some((flag) => flag === "strictAccessControl")
        ? {
              isUnderStrictControl: true,
          }
        : {};
    return {
        ref: uriRef(dashboardLink.link),
        identifier: dashboardLink.identifier!,
        uri: dashboardLink.link,
        title: dashboardLink.title!,
        description: dashboardLink.summary!,
        updated: dashboardLink.updated!,
        updatedBy: dashboardLink.contributor ? userMap?.get(dashboardLink.contributor) : undefined,
        created: dashboardLink.created!,
        createdBy: dashboardLink.author ? userMap?.get(dashboardLink.author) : undefined,
        // filter takes care of multiple spaces and also the base scenario ("" ~> [])
        tags: dashboardLink.tags?.split(" ").filter(Boolean) ?? [],
        isLocked: !!dashboardLink.locked,
        shareStatus: getShareStatus(!!dashboardLink.unlisted, !!dashboardLink.sharedWithSomeone),
        availability,
        ...isUnderStrictControlProp,
    };
};

const convertDateFilterConfigAddedPresets = (
    addPresets: GdcDashboard.IDashboardDateFilterAddedPresets,
): IDashboardDateFilterAddedPresets => {
    const { absolutePresets = [], relativePresets = [] } = addPresets;
    return {
        absolutePresets: absolutePresets.map((preset) => ({ ...preset, type: "absolutePreset" })),
        relativePresets: relativePresets.map((preset) => ({ ...preset, type: "relativePreset" })),
    };
};

export const convertDashboardDateFilterConfig = (
    dateFilterConfig: GdcDashboard.IDashboardDateFilterConfig,
): IDashboardDateFilterConfig => {
    const { filterName, mode, addPresets, hideGranularities, hideOptions } = dateFilterConfig;

    return {
        filterName,
        mode,
        addPresets: addPresets && convertDateFilterConfigAddedPresets(addPresets),
        hideGranularities,
        hideOptions,
    };
};

const convertPluginLink = (link: GdcDashboard.IDashboardPluginLink): IDashboardPluginLink => {
    const { type, parameters } = link;

    return {
        type: "IDashboardPluginLink",
        plugin: uriRef(type),
        parameters,
    };
};

const getShareStatus = (unlisted: boolean, sharedWithSomeone: boolean): ShareStatus => {
    if (unlisted && !sharedWithSomeone) {
        return "private";
    } else if (unlisted && sharedWithSomeone) {
        return "shared";
    } else {
        return "public";
    }
};

export const convertDashboard = (
    dashboard: GdcDashboard.IWrappedAnalyticalDashboard,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[] = [],
    exportFilterContextUri?: string,
    userMap?: Map<string, IUser>,
): IDashboard => {
    const {
        meta: {
            summary,
            created,
            author,
            updated,
            contributor,
            identifier,
            uri,
            title,
            locked,
            tags,
            unlisted,
            sharedWithSomeone,
            flags,
        },
        content: { layout, filterContext, dateFilterConfig, widgets: widgetsUris, plugins },
    } = dashboard.analyticalDashboard;

    const sdkDependencies = dependencies
        // Filter out visualization objects - we only need them to create implicit layout
        .filter((d) => !GdcVisualizationObject.isVisualization(d))
        .map(convertDashboardDependency);
    const unsortedWidgets = sdkDependencies.filter(isWidget);

    // To preserve the logic of createImplicitDashboardLayout, we must preserve the order of the widgets
    const widgetByUri = keyBy(unsortedWidgets, "uri");
    const widgets = widgetsUris.map((widgetUri) => widgetByUri[widgetUri]);

    const filterContextOrExportFilterContext = sdkDependencies.find((dep) =>
        exportFilterContextUri ? dep.uri === exportFilterContextUri : dep.uri === filterContext,
    ) as IFilterContext | ITempFilterContext | undefined;

    const isUnderStrictControlProp = flags?.some((flag) => flag === "strictAccessControl")
        ? {
              isUnderStrictControl: true,
          }
        : {};

    return {
        type: "IDashboard",
        title,
        description: summary!,

        identifier: identifier!,
        uri: uri!,
        ref: uriRef(uri!),

        created: created!,
        createdBy: author ? userMap?.get(author) : undefined,
        updated: updated!,
        updatedBy: contributor ? userMap?.get(contributor) : undefined,
        isLocked: !!locked,
        shareStatus: getShareStatus(!!unlisted, !!sharedWithSomeone),
        ...isUnderStrictControlProp,
        dateFilterConfig: dateFilterConfig && convertDashboardDateFilterConfig(dateFilterConfig),

        filterContext:
            exportFilterContextUri && filterContextOrExportFilterContext
                ? sanitizeExportFilterContext(filterContextOrExportFilterContext)
                : filterContextOrExportFilterContext,
        layout: layout
            ? convertLayout(layout, widgets)
            : createImplicitDashboardLayout(widgets, dependencies, visualizationClasses),

        plugins: plugins?.map(convertPluginLink),
        // filter takes care of multiple spaces and also the base scenario ("" ~> [])
        tags: tags?.split(" ").filter((t) => t) ?? [],
    };
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
