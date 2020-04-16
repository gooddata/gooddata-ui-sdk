// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

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
    widget: ObjRef;
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
