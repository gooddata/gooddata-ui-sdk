// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import isArray from "lodash/isArray.js";
import { IWidget, IWidgetDefinition, isWidget, isWidgetDefinition } from "./widget.js";

/**
 * Classification of the screen size according to its size with respect to the set breakpoints.
 *
 * @alpha
 */
export type ScreenSize = "xl" | "lg" | "md" | "sm" | "xs";

/**
 * Default dashboard widgets - kpi widget, insight widget, or nested layout.
 *
 * @alpha
 */
export type IDashboardWidget = IWidget | IWidgetDefinition | IDashboardLayout<IDashboardWidget>;

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardWidget}.
 * @alpha
 */
export const isDashboardWidget = (obj: unknown): obj is IDashboardWidget =>
    [isDashboardLayout, isWidget, isWidgetDefinition].some((guard) => guard(obj));

/**
 * Dashboard layout item - usually contains kpi widget, insight widget or another nested layout.
 * Generic TWidget param is here to support type checking with custom widgets (e.g. in Dashboard component).
 *
 * @alpha
 */
export interface IDashboardLayoutItem<TWidget = IDashboardWidget> {
    /**
     * Unique type to identify dashboard layout item.
     */
    type: "IDashboardLayoutItem";

    /**
     * Widget data - kpi widget, insight widget, nested layout or custom widget.
     */
    widget?: TWidget;

    /**
     * Item size configuration for each of the screen sizes.
     */
    size: IDashboardLayoutSizeByScreenSize;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutItem}.
 * @alpha
 */
export function isDashboardLayoutItem<TWidget>(obj: unknown): obj is IDashboardLayoutItem<TWidget> {
    return !isEmpty(obj) && typeof (obj as IDashboardLayoutItem<TWidget>).size?.xl?.gridWidth === "number";
}

/**
 * Dashboard layout describes the data to be displayed on the dashboard, and their structure for UI rendering.
 * Generic TWidget param is here to support type checking with custom widgets (e.g. in Dashboard component).
 *
 * @alpha
 */
export interface IDashboardLayout<TWidget = IDashboardWidget> {
    /**
     * Unique type to identify dashboard layout.
     */
    type: "IDashboardLayout";

    /**
     * Layout sections.
     */
    sections: IDashboardLayoutSection<TWidget>[];

    /**
     * Layout size.
     */
    size?: IDashboardLayoutSize;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayout}.
 * @alpha
 */
export function isDashboardLayout<TWidget = IDashboardWidget>(
    obj: unknown,
): obj is IDashboardLayout<TWidget> {
    return !isEmpty(obj) && (obj as IDashboardLayout<TWidget>).type === "IDashboardLayout";
}

/**
 * Dashboard layout size configuration, defined by screen type.
 *
 * @alpha
 */
export interface IDashboardLayoutSizeByScreenSize {
    /**
     * The size configuration to use for a screen with a width less than the set xs breakpoint.
     */
    xs?: IDashboardLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set xs breakpoint,
     * but smaller than the set sm breakpoint.
     */
    sm?: IDashboardLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set sm breakpoint,
     * but smaller than the set md breakpoint.
     */
    md?: IDashboardLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set md breakpoint,
     * but smaller than the set xl breakpoint.
     */
    lg?: IDashboardLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set xl breakpoint.
     * This is also default configuration
     */
    xl: IDashboardLayoutSize;
}

/**
 * Dashboard layout size definition.
 *
 * @alpha
 */
export interface IDashboardLayoutSize {
    /**
     * Width, defined as a number of grid columns (grid is 12 columns wide by default).
     */
    gridWidth: number;

    /**
     * Height, defined as a number of grid rows.
     */
    gridHeight?: number;

    /**
     * Height defined as the ratio to the width in percent.
     * Examples:
     * - When heightAsRatio is 100, the column has a 1:1 ratio.
     * - When heightAsRatio is 200, the column has a 1:2 ratio.
     * - When heightAsRatio is 50, the column has a 2:1 ratio.
     */
    heightAsRatio?: number;
}

/**
 * Dashboard layout section represents a group of widgets on the dashboard with a title and description.
 * @alpha
 */
export interface IDashboardLayoutSection<TWidget = IDashboardWidget> {
    /**
     * Unique type to identify dashboard layout section.
     */
    type: "IDashboardLayoutSection";

    /**
     * Section items.
     */
    items: IDashboardLayoutItem<TWidget>[];

    /**
     * Section header with title and description.
     */
    header?: IDashboardLayoutSectionHeader;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDashboardLayoutSection}.
 * @alpha
 */
export function isDashboardLayoutSection<TWidget>(obj: unknown): obj is IDashboardLayoutSection<TWidget> {
    return !isEmpty(obj) && isArray((obj as IDashboardLayoutSection<TWidget>).items);
}

/**
 * Dashboard layout section header definition.
 *
 * @alpha
 */
export interface IDashboardLayoutSectionHeader {
    /**
     * Section title.
     */
    title?: string;

    /**
     * Section description.
     */
    description?: string;
}
