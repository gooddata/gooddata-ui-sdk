// (C) 2019-2020 GoodData Corporation

import {
    GdcMetadata,
    GdcDashboard,
    GdcFilterContext,
    GdcVisualizationWidget,
    GdcKpi,
    GdcDashboardLayout,
    GdcVisualizationObject,
    GdcExtendedDateFilters,
} from "@gooddata/gd-bear-model";
import { uriRef } from "@gooddata/sdk-model";
import {
    IListedDashboard,
    IDashboard,
    IWidget,
    IFilterContext,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    Layout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IDateFilterConfig,
    IDashboardAddedPresets,
    ITempFilterContext,
    isWidget,
} from "@gooddata/sdk-backend-spi";

type DashboardDependency = IWidget | IFilterContext | ITempFilterContext;

export type BearDashboardDependency =
    | GdcVisualizationWidget.IWrappedVisualizationWidget
    | GdcKpi.IWrappedKPI
    | GdcFilterContext.IWrappedFilterContext
    | GdcFilterContext.IWrappedTempFilterContext;

export const convertListedDashboard = (dashboardLink: GdcMetadata.IObjectLink): IListedDashboard => ({
    ref: uriRef(dashboardLink.link),
    identifier: dashboardLink.identifier!,
    uri: dashboardLink.link,
    title: dashboardLink.title!,
    description: dashboardLink.summary!,
    updated: dashboardLink.updated!,
    created: dashboardLink.created!,
});

const convertLayoutColumn = (
    column: GdcDashboardLayout.IFluidLayoutColumn,
    widgetDependencies: IWidget[],
): IFluidLayoutColumn => {
    const { content } = column;
    if (GdcDashboardLayout.isLayoutWidget(content)) {
        const widget = widgetDependencies.find(dep => {
            const { qualifier } = content.widget;
            if (GdcVisualizationObject.isObjUriQualifier(qualifier)) {
                return qualifier.uri === dep.uri;
            }
            return qualifier.identifier === dep.identifier;
        }) as IWidget;

        return {
            ...column,
            content: {
                widget,
            },
        };
    }
    return {
        ...column,
        content: convertLayout(content!, widgetDependencies),
    };
};

const convertLayoutRow = (
    row: GdcDashboardLayout.IFluidLayoutRow,
    widgetDependencies: IWidget[],
): IFluidLayoutRow => {
    return {
        ...row,
        columns: row.columns.map(column => convertLayoutColumn(column, widgetDependencies)),
    };
};

const convertLayout = (layout: GdcDashboardLayout.Layout, widgetDependencies: IWidget[]): Layout => {
    const {
        fluidLayout: { rows },
        fluidLayout,
    } = layout;
    const convertedLayout: Layout = {
        fluidLayout: {
            ...fluidLayout,
            rows: rows.map(row => convertLayoutRow(row, widgetDependencies)),
        },
    };
    return convertedLayout;
};

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

const convertDateFilterConfig = (
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
): IDashboard => {
    const sdkDependencies = dependencies.map(convertDashboardDependency);
    const widgets = sdkDependencies.filter(isWidget);

    const {
        meta: { summary, created, updated, identifier, uri, title },
        content: { layout, filterContext, dateFilterConfig },
    } = dashboard.analyticalDashboard;

    const convertedDashboard: IDashboard = {
        title,
        description: summary,

        identifier,
        uri,
        ref: uriRef(uri),

        created: created!,
        updated: updated!,

        scheduledMails: [], // TODO: https://jira.intgdc.com/browse/RAIL-2220

        dateFilterConfig: dateFilterConfig && convertDateFilterConfig(dateFilterConfig),

        filterContext: sdkDependencies.find(dep => dep.uri === filterContext) as IFilterContext,
        layout: layout && convertLayout(layout, widgets),
    };

    return convertedDashboard;
};

const convertVisualizationWidget = (widget: GdcVisualizationWidget.IWrappedVisualizationWidget): IWidget => {
    const {
        visualizationWidget: {
            content: { visualization },
            meta: { identifier, uri, title, summary },
        },
    } = widget;

    const convertedWidget: IWidget = {
        type: "insight",
        ref: uriRef(uri),
        identifier,
        uri,
        title,
        description: summary,
        insight: uriRef(visualization),
        drills: [], // (drill to dashboard, or insight) TODO: https://jira.intgdc.com/browse/RAIL-2199
        alerts: [], // not yet supported for insight widgets
    };

    return convertedWidget;
};

const convertKpi = (widget: GdcKpi.IWrappedKPI): IWidget => {
    const {
        kpi: {
            content: { metric },
            meta: { identifier, uri, title, summary },
        },
    } = widget;

    const convertedWidget: IWidget = {
        type: "kpi",
        ref: uriRef(uri),
        identifier,
        uri,
        title,
        description: summary,
        insight: uriRef(metric),
        drills: [], // (drills to old dashboards) - TODO: https://jira.intgdc.com/browse/RAIL-2199
        alerts: [], // TODO: https://jira.intgdc.com/browse/RAIL-2218
    };

    return convertedWidget;
};

const convertFilterContextItem = (
    filterContextItem: GdcFilterContext.FilterContextItem,
): FilterContextItem => {
    if (GdcFilterContext.isAttributeFilter(filterContextItem)) {
        const {
            attributeFilter: { attributeElements, displayForm, negativeSelection },
        } = filterContextItem;

        const convertedFilterContextItem: IDashboardAttributeFilter = {
            attributeFilter: {
                attributeElements: attributeElements.map(uriRef),
                displayForm: uriRef(displayForm),
                negativeSelection,
            },
        };

        return convertedFilterContextItem;
    }
    const {
        dateFilter: { granularity, type, attribute, dataSet, from, to },
    } = filterContextItem;
    const convertedFilterContextItem: IDashboardDateFilter = {
        dateFilter: {
            granularity,
            type,
            from,
            to,
        },
    };
    if (attribute) {
        convertedFilterContextItem.dateFilter.attribute = uriRef(attribute);
    }
    if (dataSet) {
        convertedFilterContextItem.dateFilter.dataSet = uriRef(dataSet);
    }

    return convertedFilterContextItem;
};

const convertFilterContext = (filterContext: GdcFilterContext.IWrappedFilterContext): IFilterContext => {
    const {
        filterContext: {
            content: { filters },
            meta: { identifier, uri, summary, title },
        },
    } = filterContext;

    const convertedFilterContext: IFilterContext = {
        description: summary,
        identifier,
        uri,
        ref: uriRef(uri),
        title,
        filters: filters.map(convertFilterContextItem),
    };

    return convertedFilterContext;
};

const convertTempFilterContext = (
    filterContext: GdcFilterContext.IWrappedTempFilterContext,
): ITempFilterContext => {
    const {
        tempFilterContext: { created, filters, uri },
    } = filterContext;

    const convertedTempFilterContext: ITempFilterContext = {
        uri,
        ref: uriRef(uri),
        filters: filters.map(convertFilterContextItem),
        created,
    };

    return convertedTempFilterContext;
};

export const convertDashboardDependency = (dependency: BearDashboardDependency): DashboardDependency => {
    if (GdcVisualizationWidget.isWrappedVisualizationWidget(dependency)) {
        return convertVisualizationWidget(dependency);
    } else if (GdcKpi.isWrappedKpi(dependency)) {
        return convertKpi(dependency);
    } else if (GdcFilterContext.isWrappedFilterContext(dependency)) {
        return convertFilterContext(dependency);
    } else if (GdcFilterContext.isWrappedTempFilterContext(dependency)) {
        return convertTempFilterContext(dependency);
    }

    throw new Error(`No converter for the dashboard dependency!`);
};
