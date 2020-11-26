// (C) 2019-2020 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import noop from "lodash/noop";
import { IFluidLayout, IFluidLayoutColumn, IFluidLayoutRow, isFluidLayout } from "./fluidLayout";
import { IWidget, IWidgetDefinition, isWidget, isWidgetDefinition } from "../widget";
import { IDashboardLayout, IDashboardLayoutColumn, IDashboardLayoutRow } from "./dashboardLayout";

// TODO: Add support for nested layouts

/**
 * @alpha
 */
export class FluidLayoutTransforms<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> {
    protected constructor(protected readonly _layout: IFluidLayout<TContent, TColumn, TRow>) {}

    public static for<
        TContent,
        TColumn extends IFluidLayoutColumn<TContent>,
        TRow extends IFluidLayoutRow<TContent, TColumn>
    >(layout: IFluidLayout<TContent, TColumn, TRow>): FluidLayoutTransforms<TContent, TColumn, TRow> {
        return new FluidLayoutTransforms(cloneDeep(layout));
    }

    /**
     * Filter layout rows.
     * Predicate callback is called for each row, and only rows that meet the condition will remain in the layout.
     * (Similar to Array.filter, but it does not return new rows array,
     * it replaces them in the layout provided to FluidLayoutTransforms instance instead)
     */
    public filterRows = (pred: (params: { row: TRow; rowIndex: number }) => boolean): this => {
        this._layout.rows = this._layout.rows.filter((row, rowIndex) => pred({ row, rowIndex }));
        return this;
    };

    /**
     * Update layout rows.
     * Callback is called for each row, and row is replaced by the returned value.
     * (Similar to Array.map, but it does not return new rows array,
     * it replaces them in the layout provided to FluidLayoutTransforms instance instead)
     */
    public updateRows = (callback: (params: { row: TRow; rowIndex: number }) => TRow): this => {
        this._layout.rows = this._layout.rows.map((row, rowIndex) => callback({ row, rowIndex }));
        return this;
    };

    /**
     * Reduce layout rows.
     * (Similar to Array.reduce)
     */
    public reduceRows = <TResult>(
        callback: (acc: TResult, params: { row: TRow; rowIndex: number }) => TResult,
        initialValue: TResult,
    ): TResult => {
        return this._layout.rows.reduce((rowsAcc, row, rowIndex) => {
            return callback(rowsAcc, { row, rowIndex });
        }, initialValue);
    };

    /**
     * Update layout columns.
     * Callback is called for each column, and column is replaced by the returned value.
     * (Similar to Array.map, but it does not return new columns array,
     * it replaces them in the layout provided to FluidLayoutTransforms instance instead)
     */
    public updateColumns = (
        callback: (params: { column: TColumn; row: TRow; columnIndex: number; rowIndex: number }) => TColumn,
    ): this => {
        this.updateRows(({ row, rowIndex }) => {
            row.columns = row.columns.map((column, columnIndex) =>
                callback({ row, rowIndex, column, columnIndex }),
            );
            return row;
        });

        return this;
    };

    /**
     * Reduce layout columns.
     * (Similar to Array.reduce)
     */
    public reduceColumns = <TResult>(
        callback: (
            acc: TResult,
            params: { column: TColumn; row: TRow; columnIndex: number; rowIndex: number },
        ) => TResult,
        initialValue: TResult,
    ): TResult => {
        return this.reduceRows((rowsAcc, { row, rowIndex }) => {
            return row.columns.reduce((columnsAcc, column, columnIndex) => {
                return callback(columnsAcc, { row, rowIndex, column, columnIndex });
            }, rowsAcc);
        }, initialValue);
    };

    /**
     * Returns transformed layout
     */
    public layout(): IFluidLayout<TContent, TColumn, TRow> {
        return this._layout;
    }
}

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
