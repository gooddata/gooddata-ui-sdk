// (C) 2023-2026 GoodData Corporation

/** @public */
export type ColorMapping = {
    id: string;
    color:
        | {
              type: "guid";
              value: string;
          }
        | {
              type: "rgb";
              value: {
                  r: number;
                  g: number;
                  b: number;
              };
          };
};

/** @internal */
export type PointShapeSymbol = "circle" | "square" | "diamond" | "triangle" | "triangle-down";

/** @internal */
export interface IChartFill {
    type: ChartFillType;
    measureToPatternName?: Record<string, PatternFillName>;
}

/** @internal */
export type ChartFillType = "solid" | "pattern" | "outline";

/** @internal */
export type PatternFillName =
    | "diagonal_grid_small"
    | "vertical_lines_small"
    | "grid_small"
    | "horizontal_lines_small"
    | "circle_small"
    | "flag_small"
    | "waffle_small"
    | "dot_small"
    | "pyramid_small"
    | "needle_small"
    | "diamond_small"
    | "pizza_small"
    | "diagonal_grid_medium"
    | "vertical_lines_medium"
    | "grid_large"
    | "horizontal_lines_medium"
    | "circle_medium"
    | "flag_medium"
    | "waffle_medium"
    | "dot_medium"
    | "pyramid_medium"
    | "needle_medium"
    | "diamond_medium"
    | "pizza_medium";

/** @public */
export type ColumnLocator = IAttributeColumnLocator | IMeasureColumnLocator | ITotalColumnLocator;

/** @public */
export interface IAttributeColumnLocatorBody {
    attributeIdentifier: string;
    element?: string | null;
}

/** @public */
export interface ITotalColumnLocatorBody {
    attributeIdentifier: string;
    totalFunction: string;
}

/** @public */
export interface IAttributeColumnLocator {
    attributeLocatorItem: IAttributeColumnLocatorBody;
}

/** @public */
export interface ITotalColumnLocator {
    totalLocatorItem: ITotalColumnLocatorBody;
}

/** @public */
export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: IAttributeColumnWidthItemBody;
}

/** @public */
export interface IAttributeColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
    attributeIdentifier: string;
}

/** @public */
export interface IMeasureColumnWidthItemBody {
    width: ColumnWidth;
    locators: ColumnLocator[];
}

/** @public */
export interface IMeasureColumnWidthItem {
    measureColumnWidthItem: IMeasureColumnWidthItemBody;
}

/** @public */
export interface ISliceMeasureColumnWidthItemBody {
    width: ColumnWidth;
    locators: IMeasureColumnLocator[];
}

/** @public */
export interface ISliceMeasureColumnWidthItem {
    sliceMeasureColumnWidthItem: ISliceMeasureColumnWidthItemBody;
}

/** @public */
export interface IMixedValuesColumnWidthItemBody {
    width: ColumnWidth;
    locators: IMeasureColumnLocator[];
}

/** @public */
export interface IAbsoluteColumnWidth {
    value: number;
    allowGrowToFit?: boolean;
}

/** @public */
export type ColumnWidth = IAbsoluteColumnWidth | IAutoColumnWidth;

/** @public */
export interface IAutoColumnWidth {
    value: "auto";
}

/** @public */
export interface IMixedValuesColumnWidthItem {
    mixedValuesColumnWidthItem: IMixedValuesColumnWidthItemBody;
}

/** @public */
export interface IAllMeasureColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
}

/** @public */
export interface IAllMeasureColumnWidthItem {
    measureColumnWidthItem: IAllMeasureColumnWidthItemBody;
}

/** @public */
export interface IWeakMeasureColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
    locator: IMeasureColumnLocator;
}

/** @public */
export interface IWeakMeasureColumnWidthItem {
    measureColumnWidthItem: IWeakMeasureColumnWidthItemBody;
}

/** @public */
export interface IMeasureColumnLocatorBody {
    measureIdentifier: string;
}

/** @public */
export interface IMeasureColumnLocator {
    measureLocatorItem: IMeasureColumnLocatorBody;
}

/** @public */
export type ColumnWidthItem =
    | IAttributeColumnWidthItem
    | IMeasureColumnWidthItem
    | ISliceMeasureColumnWidthItem
    | IMixedValuesColumnWidthItem
    | IAllMeasureColumnWidthItem
    | IWeakMeasureColumnWidthItem;
