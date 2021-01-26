// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";

/**
 * Classification of the screen size according to its size with respect to the set breakpoints.
 *
 * @alpha
 */
export type ResponsiveScreenType = "xl" | "lg" | "md" | "sm" | "xs";

/**
 * Fluid layout definition.
 *
 * @alpha
 */
export interface IFluidLayout<TContent> {
    /**
     * Unique type to identify fluid layout.
     */
    type: "fluidLayout";

    /**
     * Layout rows.
     */
    rows: IFluidLayoutRow<TContent>[];

    /**
     * Layout size.
     */
    size?: IFluidLayoutSize;

    /**
     * Custom layout style.
     */
    style?: string;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IFluidLayout}.
 * @alpha
 */
export function isFluidLayout<TContent>(obj: unknown): obj is IFluidLayout<TContent> {
    return !isEmpty(obj) && (obj as IFluidLayout<TContent>).type === "fluidLayout";
}

/**
 * Fluid layout row definition.
 * @alpha
 */
export interface IFluidLayoutRow<TContent> {
    /**
     * Row columns.
     */
    columns: IFluidLayoutColumn<TContent>[];

    /**
     * Custom row style.
     */
    style?: string;

    /**
     * Row can optionally contain a header with title and description.
     */
    header?: IFluidLayoutSectionHeader;
}

/**
 * Fluid layout column definition.
 * @alpha
 */
export interface IFluidLayoutColumn<TContent> {
    /**
     * Column content.
     */
    content?: TContent;

    /**
     * Column size.
     */
    size: IFluidLayoutSizeByScreen;

    /**
     * Column style.
     */
    style?: string;
}

/**
 * Fluid layout column size configuration, defined by screen type.
 *
 * @alpha
 */
export interface IFluidLayoutSizeByScreen {
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
 * Fluid layout responsive size definition.
 * @alpha
 */
export interface IFluidLayoutSize {
    /**
     * Width, defined as a count of grid columns.
     */
    widthAsGridColumnsCount: number;

    /**
     * Height defined as the ratio to the width in percent.
     * Examples:
     * - When heightAsRatio is 100, the column has a 1:1 ratio.
     * - When heightAsRatio is 200, the column has a 1:2 ratio.
     * - When heightAsRatio is 50, the column has a 2:1 ratio.
     *
     */
    heightAsRatio?: number;
}

/**
 * Fluid layout section header definition.
 *
 * @alpha
 */
export interface IFluidLayoutSectionHeader {
    /**
     * Fluid layout section title.
     */
    title?: string;

    /**
     * Fluid layout section description,
     */
    description?: string;
}
