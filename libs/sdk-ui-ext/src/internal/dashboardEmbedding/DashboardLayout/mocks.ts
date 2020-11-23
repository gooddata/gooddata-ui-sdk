// (C) 2007-2020 GoodData Corporation
import { IFluidLayoutSize } from "@gooddata/sdk-backend-spi";
import {
    IDashboardViewLayoutContentRowHeader,
    DashboardViewLayoutWidgetClass,
    IDashboardViewLayout,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutContentWidget,
    IDashboardViewLayoutCustomContent,
    IDashboardViewLayoutContent,
} from "./interfaces/dashboardLayout";

export type DashboardLayoutRowMock = {
    title?: string;
    description?: string;
    contentAndSizePairs: ([IDashboardViewLayoutContent, IFluidLayoutSize] | [IDashboardViewLayoutContent])[];
};

export const dashboardRowHeaderMock = (
    title?: string,
    description?: string,
): IDashboardViewLayoutContentRowHeader => {
    return {
        type: "rowHeader",
        description,
        title,
    };
};

export const dashboardCustomMock = (): IDashboardViewLayoutCustomContent => {
    return {
        type: "custom",
    };
};

export const dashboardWidgetMock = (
    id: string,
    widgetClass: DashboardViewLayoutWidgetClass = "bar",
    resizedByLayout = false,
): IDashboardViewLayoutContentWidget => {
    return {
        type: "widget",
        widgetClass,
        widget: {
            description: "",
            drills: [],
            ignoreDashboardFilters: [],
            identifier: id,
            ref: {
                identifier: id,
            },
            title: `${widgetClass} ${id}`,
            type: widgetClass === "kpi" ? "kpi" : "insight",
            uri: id,
        },
        resizedByLayout,
    };
};

export const dashboardRowMock = (
    contentAndSizePairs: ([IDashboardViewLayoutContent, IFluidLayoutSize] | [IDashboardViewLayoutContent])[],
    title?: string,
    description?: string,
): DashboardLayoutRowMock => {
    return {
        contentAndSizePairs,
        title,
        description,
    };
};

export const dashboardLayoutMock = (rowMocks: DashboardLayoutRowMock[]): IDashboardViewLayout => {
    const emptyLayout: IDashboardViewLayout = {
        type: "fluidLayout",
        rows: [],
    };

    return rowMocks.reduce((acc: IDashboardViewLayout, rowMock, rowIndex) => {
        if (!acc.rows[rowIndex]) {
            acc.rows[rowIndex] = {
                columns: [],
                ...(rowMock.title || rowMock.description
                    ? {
                          header: {
                              title: rowMock.title,
                              description: rowMock.description,
                          },
                      }
                    : {}),
            };
        }

        return rowMock.contentAndSizePairs.reduce(
            (acc2: IDashboardViewLayout, [content, size = { widthAsGridColumnsCount: 12 }], columnIndex) => {
                const column: IDashboardViewLayoutColumn = {
                    size: {
                        xl: size,
                    },
                    content,
                };
                acc2.rows[rowIndex].columns[columnIndex] = column;
                return acc2;
            },
            acc,
        );
    }, emptyLayout);
};

export const allWidgetClasses: DashboardViewLayoutWidgetClass[] = [
    "alluvial",
    "area",
    "bar",
    "bubble",
    "bullet",
    "column",
    "combo",
    "combo2",
    "donut",
    "funnel",
    "geo",
    "headline",
    "heatmap",
    "histogram",
    "line",
    "pareto",
    "pushpin",
    "pie",
    "scatter",
    "table",
    "treemap",
    "waterfall",
    "xirr",
    "kpi",
];
