// (C) 2019-2021 GoodData Corporation
import noop from "lodash/noop";
import { IFluidLayout, isFluidLayout } from "./fluidLayout";
import { IWidget, IWidgetDefinition, isWidget, isWidgetDefinition } from "../widget";
import { IDashboardLayout, IDashboardLayoutColumn, IDashboardLayoutRow } from "./dashboardLayout";

/**
 * Has fluid layout only empty rows and columns?
 * @alpha
 */
export const isFluidLayoutEmpty = (layout: IFluidLayout<any>): boolean => {
    return layout.rows.every((row) => row.columns.length === 0);
};

/**
 * Represents nested path in layout
 * It's useful to track the layout location of the widget
 * @alpha
 */
export type LayoutPath = Array<string | number>;

/**
 * Walk dashboard layout
 * This is useful to collect widgets from the layout or perform transforms on the layout
 *
 * @alpha
 * @param layout - dashboard layout
 * @param callbacks - walk callbacks
 * @returns void
 */
export function walkLayout(
    layout: IDashboardLayout,
    {
        rowCallback = noop,
        columnCallback = noop,
        widgetCallback = noop,
    }: {
        rowCallback?: (row: IDashboardLayoutRow, rowPath: LayoutPath) => void;
        columnCallback?: (column: IDashboardLayoutColumn, columnPath: LayoutPath) => void;
        widgetCallback?: (widget: IWidget | IWidgetDefinition, widgetPath: LayoutPath) => void;
    },
    path: LayoutPath = ["rows"],
): void {
    layout.rows.forEach((row, rowIndex) => {
        const rowPath = [...path, rowIndex];
        rowCallback(row, rowPath);
        row.columns.forEach((column, columnIndex) => {
            const columnPath = [...rowPath, "columns", columnIndex];
            columnCallback(column, columnPath);
            if (isWidget(column.content) || isWidgetDefinition(column.content)) {
                const widgetPath = [...columnPath, "content"];
                widgetCallback(column.content, widgetPath);
            } else if (isFluidLayout(column.content)) {
                // is another layout
                walkLayout(
                    column.content,
                    {
                        rowCallback,
                        columnCallback,
                        widgetCallback,
                    },
                    [...columnPath, "content", "rows"],
                );
            }
        });
    });
}

/**
 * Widget with it's layout path
 * @alpha
 */
export interface IWidgetWithLayoutPath {
    path: LayoutPath;
    widget: IWidget | IWidgetDefinition;
}

/**
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @param collectedWidgets - bag for collecting widgets recursively from the layout
 * @returns - widgets with layout paths
 */
export function layoutWidgetsWithPaths(layout: IDashboardLayout): IWidgetWithLayoutPath[] {
    const collectedWidgets: IWidgetWithLayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (widget, path) =>
            collectedWidgets.push({
                widget,
                path,
            }),
    });

    return collectedWidgets;
}

/**
 * @alpha
 */
export function layoutWidgets(layout: IDashboardLayout): Array<IWidgetDefinition | IWidget>;
/**
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @returns - widgets
 */
export function layoutWidgets(layout: IDashboardLayout): Array<IWidgetDefinition | IWidget> {
    const collectedWidgets: Array<IWidgetDefinition | IWidget> = [];
    walkLayout(layout, {
        widgetCallback: (widget) => collectedWidgets.push(widget),
    });

    return collectedWidgets;
}
