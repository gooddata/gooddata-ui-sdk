// (C) 2019-2020 GoodData Corporation
import { IWidget, IWidgetDefinition, isWidget, isWidgetDefinition } from "./widget";
import isEmpty from "lodash/isEmpty";
import noop from "lodash/noop";

/**
 * Dashboard layout
 * @alpha
 */
export type Layout = IFluidLayout;

/**
 * Layout widget
 * @alpha
 */
export type Widget = ILayoutWidget;

/**
 * Layout content - widget or another layout
 * @alpha
 */
export type LayoutContent = Widget | Layout;

/**
 * Layout reference to the widget
 * @alpha
 */
export interface ILayoutWidget {
    /**
     * Widget object reference
     */
    widget: IWidget;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILayoutWidget}.
 * @alpha
 */
export function isLayoutWidget(obj: unknown): obj is ILayoutWidget {
    return !isEmpty(obj) && isWidget((obj as any).widget);
}

/**
 * Fluid layout definition
 * @alpha
 */
export interface IFluidLayout {
    fluidLayout: {
        /**
         * Layout rows
         */
        rows: IFluidLayoutRow[];

        /**
         * Layout size
         */
        size?: IFluidLayoutSize;

        /**
         * Layout style
         */
        style?: string;
    };
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFluidLayout}.
 * @alpha
 */
export function isFluidLayout(obj: unknown): obj is IFluidLayout {
    return hasFluidLayoutProps(obj) && layoutWidgets(obj as any).every(isWidget);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFluidLayoutDefinition}.
 * @alpha
 */
export function isFluidLayoutDefinition(obj: unknown): obj is IFluidLayoutDefinition {
    return hasFluidLayoutProps(obj) && layoutWidgets(obj as any).some(isWidgetDefinition);
}

/**
 * @internal
 */
function hasFluidLayoutProps(obj: unknown): boolean {
    return !isEmpty(obj) && !!(obj as IFluidLayoutDefinition | IFluidLayout)?.fluidLayout?.rows;
}

/**
 * Fluid layout row definition
 * @alpha
 */
export interface IFluidLayoutRow {
    /**
     * Row columns
     */
    columns: IFluidLayoutColumn[];

    /**
     * Row style
     */
    style?: string;

    /**
     * Row header
     */
    header?: SectionHeader;
}

/**
 * Fluid layout column definition
 * @alpha
 */
export interface IFluidLayoutColumn {
    /**
     * Column content - widget or another layout
     */
    content?: LayoutContent;

    /**
     * Column size
     */
    size: IFluidLayoutColSize;

    /**
     * Column style
     */
    style?: string;
}

/**
 * Fluid layout column size
 * @alpha
 */
export interface IFluidLayoutColSize {
    /**
     * The size configuration to use for a screen with a width less than the set xs breakpoint.
     */
    xs?: IFluidLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set xs breakpoint,
     * but smaller than the set sm breakpoint.
     */
    sm?: IFluidLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set sm breakpoint,
     * but smaller than the set md breakpoint.
     */
    md?: IFluidLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set md breakpoint,
     * but smaller than the set xl breakpoint.
     */
    lg?: IFluidLayoutSize;

    /**
     * The size configuration to use for a screen larger than the set xl breakpoint.
     * This is also default configuration
     */
    xl: IFluidLayoutSize;
}

/**
 * Fluid layout size
 * @alpha
 */
export interface IFluidLayoutSize {
    /**
     * Width, defined as a count of grid columns.
     */
    width: number;

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
 * Layout section header
 * @alpha
 */
export type SectionHeader = ISectionHeader | ISectionDescription;

/**
 * Section header
 * @alpha
 */
export interface ISectionHeader {
    /**
     * Section title
     */
    title: string;

    /**
     * Section description
     */
    description?: string;
}

/**
 * Section header without title
 * @alpha
 */
export interface ISectionDescription {
    /**
     * Section description
     */
    description: string;
}

/**
 * Dashboard layout definition
 * @alpha
 */
export type LayoutDefinition = IFluidLayoutDefinition;

/**
 * Layout widget definition
 * @alpha
 */
export type LayoutWidgetDefinition = ILayoutWidgetDefinition;

/**
 * Layout definition content - widget or another layout
 * @alpha
 */
export type LayoutDefinitionContent = Widget | Layout | LayoutDefinition | LayoutWidgetDefinition;

/**
 * Fluid layout definition
 * @alpha
 */
export interface IFluidLayoutDefinition {
    fluidLayout: {
        /**
         * Layout rows
         */
        rows: IFluidLayoutRowDefinition[];

        /**
         * Layout size
         */
        size?: IFluidLayoutSize;

        /**
         * Layout style
         */
        style?: string;
    };
}

/**
 * Fluid layout row definition
 * @alpha
 */
export interface IFluidLayoutRowDefinition {
    /**
     * Row columns
     */
    columns: IFluidLayoutColumnDefinition[];

    /**
     * Row style
     */
    style?: string;

    /**
     * Row header
     */
    header?: SectionHeader;
}

/**
 * Fluid layout column definition
 * @alpha
 */
export interface IFluidLayoutColumnDefinition {
    /**
     * Column content - widget or another layout
     */
    content?: LayoutDefinitionContent;

    /**
     * Column size
     */
    size: IFluidLayoutColSize;

    /**
     * Column style
     */
    style?: string;
}

/**
 * Layout reference to the widget
 * @alpha
 */
export interface ILayoutWidgetDefinition {
    /**
     * Widget object reference
     */
    widget: IWidget | IWidgetDefinition;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ILayoutWidgetDefinition}.
 * @alpha
 */
export function isLayoutWidgetDefinition(obj: unknown): obj is ILayoutWidgetDefinition {
    return !isEmpty(obj) && isWidgetDefinition((obj as any).widget);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ISectionHeader}.
 * @alpha
 */
export function isSectionHeader(obj: unknown): obj is ISectionHeader {
    return !isEmpty(obj) && !!(obj as ISectionHeader).title;
}

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
    layout: Layout | LayoutDefinition,
    {
        rowCallback = noop,
        columnCallback = noop,
        widgetCallback = noop,
    }: {
        rowCallback?: (row: IFluidLayoutRow | IFluidLayoutRowDefinition, rowPath: LayoutPath) => void;
        columnCallback?: (
            column: IFluidLayoutColumn | IFluidLayoutColumnDefinition,
            columnPath: LayoutPath,
        ) => void;
        widgetCallback?: (widget: IWidget | IWidgetDefinition, widgetPath: LayoutPath) => void;
    },
    path: LayoutPath = ["fluidLayout", "rows"],
): void {
    layout.fluidLayout.rows.forEach((row, rowIndex) => {
        const rowPath = [...path, rowIndex];
        rowCallback(row, rowPath);
        row.columns.forEach((column, columnIndex) => {
            const columnPath = [...rowPath, "columns", columnIndex];
            columnCallback(column, columnPath);
            if (isLayoutWidget(column.content) || isLayoutWidgetDefinition(column.content)) {
                const widgetPath = [...columnPath, "content", "widget"];
                widgetCallback(column.content.widget, widgetPath);
            } else if (isFluidLayout(column.content) || isFluidLayoutDefinition(column.content)) {
                // is another layout
                walkLayout(
                    column.content,
                    {
                        rowCallback,
                        columnCallback,
                        widgetCallback,
                    },
                    [...columnPath, "content", "fluidLayout", "rows"],
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
    widget: IWidget;
}

/**
 * Widget definition with it's layout path
 * @alpha
 */
export interface IWidgetDefinitionWithLayoutPath {
    path: LayoutPath;
    widget: IWidgetDefinition;
}

/**
 * Widget definition or widget with it's layout path
 * @alpha
 */
export type IWidgetOrDefinitionWithLayoutPath = IWidgetWithLayoutPath | IWidgetDefinitionWithLayoutPath;

/**
 * @alpha
 */
export function layoutWidgetsWithPaths(layout: Layout): IWidgetWithLayoutPath[];
/**
 * @alpha
 */
export function layoutWidgetsWithPaths(layout: LayoutDefinition): IWidgetOrDefinitionWithLayoutPath[];
/**
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @param collectedWidgets - bag for collecting widgets recursively from the layout
 * @returns - widgets with layout paths
 */
export function layoutWidgetsWithPaths(
    layout: Layout | LayoutDefinition,
): IWidgetOrDefinitionWithLayoutPath[] {
    const collectedWidgets: IWidgetOrDefinitionWithLayoutPath[] = [];
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
export function layoutWidgets(layout: Layout): IWidget[];
/**
 * @alpha
 */
export function layoutWidgets(layout: LayoutDefinition): Array<IWidgetDefinition | IWidget>;
/**
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @returns - widgets
 */
export function layoutWidgets(layout: Layout | LayoutDefinition): Array<IWidgetDefinition | IWidget> {
    const collectedWidgets: Array<IWidgetDefinition | IWidget> = [];
    walkLayout(layout, {
        widgetCallback: (widget) => collectedWidgets.push(widget),
    });

    return collectedWidgets;
}
