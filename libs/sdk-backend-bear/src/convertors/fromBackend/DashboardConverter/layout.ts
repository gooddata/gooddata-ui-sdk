// (C) 2019-2020 GoodData Corporation

import { GdcDashboardLayout, GdcVisualizationObject, GdcVisualizationClass } from "@gooddata/api-model-bear";
import { uriRef, idRef, UriRef, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    IDashboardLayout,
    IDashboardLayoutColumn,
    IDashboardLayoutRow,
    IWidget,
    ResponsiveScreenType,
} from "@gooddata/sdk-backend-spi";
import { BearDashboardDependency } from "./types";

// Default layout column size for the kpi widget, when generating implicit layout
const KPI_SIZE = 2;
// Default layout column size for the visualization widget, when generating implicit layout
const VISUALIZATION_SIZE = 12;

export const convertResponsiveSize = (size: GdcDashboardLayout.IFluidLayoutSize): IFluidLayoutSize => {
    const converted: IFluidLayoutSize = {
        widthAsGridColumnsCount: size.width,
    };
    if (size.heightAsRatio) {
        converted.heightAsRatio = size.heightAsRatio;
    }

    return converted;
};

export const convertLayoutColumnSize = (
    column: GdcDashboardLayout.IFluidLayoutColSize,
): IFluidLayoutSizeByScreen => {
    const allScreens: ResponsiveScreenType[] = ["xl", "md", "lg", "sm", "xs"];

    return allScreens.reduce((acc: IFluidLayoutSizeByScreen, el) => {
        const size = column[el];
        if (size) {
            return {
                ...acc,
                [el]: convertResponsiveSize(size),
            };
        }

        return acc;
    }, {} as IFluidLayoutSizeByScreen);
};

const convertLayoutColumn = (
    column: GdcDashboardLayout.IFluidLayoutColumn,
    widgetDependencies: IWidget[],
): IDashboardLayoutColumn => {
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
            size: convertLayoutColumnSize(column.size),
            content: widget,
        };
    }

    return {
        content: content && convertLayout(content, widgetDependencies),
        style: column.style,
        size: convertLayoutColumnSize(column.size),
    };
};

const convertLayoutRow = (
    row: GdcDashboardLayout.IFluidLayoutRow,
    widgetDependencies: IWidget[],
): IDashboardLayoutRow => {
    return {
        ...row,
        columns: row.columns.map((column) => convertLayoutColumn(column, widgetDependencies)),
    };
};

export const convertLayout = (
    layout: GdcDashboardLayout.Layout,
    widgetDependencies: IWidget[],
): IDashboardLayout => {
    const {
        fluidLayout: { rows },
        fluidLayout,
    } = layout;
    const convertedLayout: IDashboardLayout = {
        type: "fluidLayout",
        rows: rows.map((row) => convertLayoutRow(row, widgetDependencies)),
    };
    if (fluidLayout.size) {
        convertedLayout.size = convertResponsiveSize(fluidLayout.size);
    }
    if (fluidLayout.style) {
        convertedLayout.style = fluidLayout.style;
    }
    return convertedLayout;
};

/**
 * Create {@link ILegacyDashboardLayout} from {@link IWidget} items. As widgets do not contain any layout information,
 * implicit layout with a single row will be generated.
 *
 * @returns fluid layout created from the widgets
 */
export function createImplicitDashboardLayout(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IDashboardLayout | undefined {
    if (widgets.length < 1) {
        return undefined;
    }
    const rows = createRows(widgets, dependencies, visualizationClasses);

    return {
        type: "fluidLayout",
        rows,
    };
}

function createRows(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IDashboardLayoutRow[] {
    return [{ columns: createColumns(widgets, dependencies, visualizationClasses) }];
}

function createColumns(
    widgets: IWidget[],
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IDashboardLayoutColumn[] {
    return widgets.map((widget) => createColumn(widget, dependencies, visualizationClasses));
}

function createColumn(
    widget: IWidget,
    dependencies: BearDashboardDependency[],
    visualizationClasses: GdcVisualizationClass.IVisualizationClassWrapped[],
): IDashboardLayoutColumn {
    return {
        content: widget,
        size: {
            xl: {
                widthAsGridColumnsCount: findImplicitWidgetWidth(widget, dependencies, visualizationClasses),
            },
        },
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
