// (C) 2019-2020 GoodData Corporation
import { DashboardViewLayoutWidgetClass } from "./dashboardLayout";

/**
 * Dictionary with default size configuration by widget class.
 *
 * @alpha
 */
export type DashboardViewWidgetDimensionsByWidgetClass = {
    [key in DashboardViewLayoutWidgetClass]?: IDashboardViewWidgetDimension;
};

/**
 * Default size configuration for the widget.
 *
 * @alpha
 */
export interface IDashboardViewWidgetDimension {
    /**
     * Minimal width of the widget, defined as grid columns count.
     */
    minWidth: number;

    /**
     * Default width of the widget, defined as grid columns count.
     */
    defWidth: number;

    /**
     * Default height of the widget, defined in pixels.
     */
    defHeightPx: number;
}
