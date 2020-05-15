// (C) 2019-2020 GoodData Corporation
import { IWidget } from "./widget";
import isEmpty from "lodash/isEmpty";

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
export function isLayoutWidget(obj: any): obj is ILayoutWidget {
    return !isEmpty(obj) && !!(obj as ILayoutWidget).widget;
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
export function isFluidLayout(obj: any): obj is IFluidLayout {
    return !isEmpty(obj) && !!(obj as IFluidLayout).fluidLayout;
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
     * TODO: docs
     */
    xl: IFluidLayoutSize;

    /**
     * TODO: docs
     */
    xs?: IFluidLayoutSize;

    /**
     * TODO: docs
     */
    sm?: IFluidLayoutSize;

    /**
     * TODO: docs
     */
    md?: IFluidLayoutSize;

    /**
     * TODO: docs
     */
    lg?: IFluidLayoutSize;
}

/**
 * Fluid layout size
 * @alpha
 */
export interface IFluidLayoutSize {
    /**
     * Width
     */
    width: number;

    /**
     * Height, defined as ratio
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
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @param collectedWidgets - bag for collecting widgets recursively from the layout
 */
export const layoutWidgets = (layout: Layout, collectedWidgets: IWidget[] = []): IWidget[] => {
    layout.fluidLayout.rows.forEach(row => {
        row.columns.forEach(column => {
            if (isLayoutWidget(column.content)) {
                collectedWidgets.push(column.content.widget);
            } else if (isFluidLayout(column.content)) {
                // is another layout
                layoutWidgets(column.content);
            }
        });
    });

    return collectedWidgets;
};
