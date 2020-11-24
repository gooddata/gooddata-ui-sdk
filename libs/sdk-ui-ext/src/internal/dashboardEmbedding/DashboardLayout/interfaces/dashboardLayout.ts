// (C) 2019-2020 GoodData Corporation
import { VisType } from "@gooddata/sdk-ui";
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IWidget,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";

/**
 * Dashboard layout widget classification.
 * Used to calculate the size of a layout column based on the widget it contains.
 *
 * @alpha
 */
export type DashboardViewLayoutWidgetClass = VisType | "kpi";

/**
 * Dashboard layout content classification.
 * With respect to the previous implementation,
 * row headers are converted to columns with the maximum width set (so they are rendered as rows).
 * This is not ideal and we should handle rowHeader rendering in another separate component (eg. add rowHeaderRenderer) in the future.
 *
 * @alpha
 */
export type DashboardViewLayoutContentType = "widget" | "rowHeader" | "custom";

/**
 * Default dashboard content interface, with common properties.
 *
 * @alpha
 */
export interface IDashboardViewLayoutContentBase {
    /**
     * Dashboard layout content classification.
     */
    type: DashboardViewLayoutContentType;
}

/**
 * The content of the dashboard layout representing the widget.
 *
 * @alpha
 */
export interface IDashboardViewLayoutContentWidget extends IDashboardViewLayoutContentBase {
    /**
     * Dashboard layout content classification.
     */
    type: "widget";

    /**
     * Dashboard layout widget.
     */
    widget: IWidget | IWidgetDefinition;

    /**
     * Dashboard layout widget classification.
     * Used to calculate the size of a layout column based on the widget it contains.
     */
    widgetClass?: DashboardViewLayoutWidgetClass;

    /**
     * The dashboard layout "unifies" the height of the columns rendered in one row (with the highest one).
     * - Note that the rendered row may not be the same as the original row of the layout.
     *   We mean the actual rendered rows according to the set column widths - e.g. for a grid with 12 columns,
     *   if I have 2 columns, each with a width of 6, it is equal to one row)
     *
     * - This serves only for debugging purposes. When you are in a dashboard layout "debug mode",
     *   it visually marks the resized columns with a dashed border.
     *
     */
    resizedByLayout?: boolean;
}

/**
 * The content of the dashboard layout representing the row header.
 * With respect to the previous implementation,
 * row headers are converted to columns with the maximum width set (so they are rendered as rows).
 * This is not ideal and we should handle rowHeader rendering in another separate component (eg. rowHeaderRenderer) in the future.
 *
 * @alpha
 */
export interface IDashboardViewLayoutContentRowHeader extends IDashboardViewLayoutContentBase {
    /**
     * Dashboard layout content classification.
     */
    type: "rowHeader";

    /**
     * Row header title.
     */
    title?: string;

    /**
     * Row header description.
     */
    description?: string;
}

/**
 * The content of the dashboard layout representing the custom content.
 * This allows extending the dashboard layout with custom widgets.
 *
 * @alpha
 */
export interface IDashboardViewLayoutCustomContent extends IDashboardViewLayoutContentBase {
    /**
     * Dashboard layout content classification.
     */
    type: "custom";
}

/**
 * Alias for all supported dashboard layout content
 *
 * @alpha
 */
export type IDashboardViewLayoutContent =
    | IDashboardViewLayoutContentWidget
    | IDashboardViewLayoutContentRowHeader
    | IDashboardViewLayoutCustomContent;

/**
 * Dashboard layout column definition.
 *
 * @alpha
 */
export type IDashboardViewLayoutColumn = IFluidLayoutColumn<IDashboardViewLayoutContent>;

/**
 * Dashboard layout row definition.
 *
 * @alpha
 */
export type IDashboardViewLayoutRow = IFluidLayoutRow<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn
>;

/**
 * Dashboard layout definition.
 *
 * @alpha
 */
export type IDashboardViewLayout = IFluidLayout<
    IDashboardViewLayoutContent,
    IDashboardViewLayoutColumn,
    IDashboardViewLayoutRow
>;
