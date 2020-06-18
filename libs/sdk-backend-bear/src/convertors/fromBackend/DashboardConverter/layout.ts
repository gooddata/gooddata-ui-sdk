// (C) 2019-2020 GoodData Corporation

import { GdcDashboardLayout, GdcVisualizationObject, GdcVisualizationClass } from "@gooddata/gd-bear-model";
import { uriRef, idRef, UriRef, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IWidget,
    Layout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayout,
} from "@gooddata/sdk-backend-spi";
import { BearDashboardDependency } from "./types";

// Default layout column size for the kpi widget, when generating implicit layout
const KPI_SIZE = 2;
// Default layout column size for the visualization widget, when generating implicit layout
const VISUALIZATION_SIZE = 12;

const convertLayoutColumn = (
    column: GdcDashboardLayout.IFluidLayoutColumn,
    widgetDependencies: IWidget[],
): IFluidLayoutColumn => {
    const { content } = column;
    if (GdcDashboardLayout.isLayoutWidget(content)) {
        const widget = widgetDependencies.find((dep) => {
            const { qualifier } = content.widget;
            if (GdcVisualizationObject.isObjUriQualifier(qualifier)) {
                return areObjRefsEqual(uriRef(qualifier.uri), dep.ref);
            }

            return areObjRefsEqual(idRef(qualifier.identifier), dep.ref);
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
        content: content && convertLayout(content, widgetDependencies),
    };
};

const convertLayoutRow = (
    row: GdcDashboardLayout.IFluidLayoutRow,
    widgetDependencies: IWidget[],
): IFluidLayoutRow => {
    return {
        ...row,
        columns: row.columns.map((column) => convertLayoutColumn(column, widgetDependencies)),
    };
};

export const convertLayout = (layout: GdcDashboardLayout.Layout, widgetDependencies: IWidget[]): Layout => {
    const {
        fluidLayout: { rows },
        fluidLayout,
    } = layout;
    const convertedLayout: Layout = {
        fluidLayout: {
            ...fluidLayout,
            rows: rows.map((row) => convertLayoutRow(row, widgetDependencies)),
        },
    };
    return convertedLayout;
};

/**
 * Create {@link IFluidLayout} from {@link IWidget} items. As widgets do not contain any layout information,
 * implicit layout with a single row will be generated.
 *
 * @returns fluid layout created from the widgets
 */
export function createImplicitDashboardLayout(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayout | undefined {
    if (widgets.length < 1) {
        return undefined;
    }
    const rows = createRows(widgets, dependencies, visualizationClasses);

    return {
        fluidLayout: {
            rows,
        },
    };
}

function createRows(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayoutRow[] {
    return [{ columns: createColumns(widgets, dependencies, visualizationClasses) }];
}

function createColumns(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayoutColumn[] {
    return widgets.map((widget) => createColumn(widget, dependencies, visualizationClasses));
}

function createColumn(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IFluidLayoutColumn {
    return {
        content: {
            widget,
        },
        size: { xl: { width: findImplicitWidgetWidth(widget, dependencies, visualizationClasses) } },
    };
}

function findImplicitWidgetWidth(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
) {
    if (widget.type === "kpi") {
        return KPI_SIZE;
    }

    const visualizationUri = (widget.insight as UriRef).uri;
    const vis = dependencies.find(
        (v) =>
            GdcVisualizationObject.isVisualization(v) && v.visualizationObject.meta.uri === visualizationUri,
    ) as GdcVisualizationObject.IVisualization;
    const visualizationClassUri = vis.visualizationObject.content.visualizationClass.uri;
    const visualizationClass = visualizationClasses.find(
        (visClass) => visClass.visualizationClass.meta.uri === visualizationClassUri,
    );
    return getVisualizationLegacyWidth(visualizationClass!);
}

function getVisualizationLegacyWidth(visualizationClass: GdcVisualizationClass.IVisualizationClassWrapped) {
    const visualizationType = visualizationClass.visualizationClass.content.url.split(":")[1];
    return visualizationType === "headline" ? KPI_SIZE : VISUALIZATION_SIZE;
}
