// (C) 2021 GoodData Corporation

/**
 * @alpha
 */
export type LayoutType = "fluid"; // only supported layout for now

/**
 * Layout descriptor.
 * Provides parameters of used layout.
 *
 * @alpha
 */
export interface ILayoutDescriptor {
    type: LayoutType;
}

/**
 * Fluid Layout descriptor.
 * Provides parameters of fluid layout.
 *
 * @alpha
 */
export interface IFluidLayoutDescriptor extends ILayoutDescriptor {
    type: "fluid";
    /**
     * Total number of grid columns. Used if visualization should take 100% width by its size
     */
    gridColumnsCount: number;
    /**
     * Height of one grid row in px. It is used for conversion of height between grid rows and px
     */
    gridRowHeight: number;
    /**
     * Converts height in px to the height in layout units
     */
    toGridHeight(heightPx: number): number;
    /**
     * Converts height in layout units to the height in px
     */
    toHeightInPx(height: number): number;
}
