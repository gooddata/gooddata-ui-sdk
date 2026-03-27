// (C) 2023-2026 GoodData Corporation

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

export type PointShapeSymbol = "circle" | "square" | "diamond" | "triangle" | "triangle-down";

export interface IChartFill {
    type: ChartFillType;
    measureToPatternName?: Record<string, PatternFillName>;
}

export type ChartFillType = "solid" | "pattern" | "outline";

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

export type ColumnLocator = IAttributeColumnLocator | IMeasureColumnLocator | ITotalColumnLocator;

export interface IAttributeColumnLocatorBody {
    attributeIdentifier: string;
    element?: string | null;
}

export interface ITotalColumnLocatorBody {
    attributeIdentifier: string;
    totalFunction: string;
}

export interface IAttributeColumnLocator {
    attributeLocatorItem: IAttributeColumnLocatorBody;
}

export interface ITotalColumnLocator {
    totalLocatorItem: ITotalColumnLocatorBody;
}

export interface IAttributeColumnWidthItem {
    attributeColumnWidthItem: IAttributeColumnWidthItemBody;
}

export interface IAttributeColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
    attributeIdentifier: string;
}

export interface IMeasureColumnWidthItemBody {
    width: ColumnWidth;
    locators: ColumnLocator[];
}

export interface IMeasureColumnWidthItem {
    measureColumnWidthItem: IMeasureColumnWidthItemBody;
}

export interface ISliceMeasureColumnWidthItemBody {
    width: ColumnWidth;
    locators: IMeasureColumnLocator[];
}

export interface ISliceMeasureColumnWidthItem {
    sliceMeasureColumnWidthItem: ISliceMeasureColumnWidthItemBody;
}

export interface IMixedValuesColumnWidthItemBody {
    width: ColumnWidth;
    locators: IMeasureColumnLocator[];
}

export interface IAbsoluteColumnWidth {
    value: number;
    allowGrowToFit?: boolean;
}

export type ColumnWidth = IAbsoluteColumnWidth | IAutoColumnWidth;

export interface IAutoColumnWidth {
    value: "auto";
}

export interface IMixedValuesColumnWidthItem {
    mixedValuesColumnWidthItem: IMixedValuesColumnWidthItemBody;
}

export interface IAllMeasureColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
}

export interface IAllMeasureColumnWidthItem {
    measureColumnWidthItem: IAllMeasureColumnWidthItemBody;
}

export interface IWeakMeasureColumnWidthItemBody {
    width: IAbsoluteColumnWidth;
    locator: IMeasureColumnLocator;
}

export interface IWeakMeasureColumnWidthItem {
    measureColumnWidthItem: IWeakMeasureColumnWidthItemBody;
}

export interface IMeasureColumnLocatorBody {
    measureIdentifier: string;
}

export interface IMeasureColumnLocator {
    measureLocatorItem: IMeasureColumnLocatorBody;
}

export type ColumnWidthItem =
    | IAttributeColumnWidthItem
    | IMeasureColumnWidthItem
    | ISliceMeasureColumnWidthItem
    | IMixedValuesColumnWidthItem
    | IAllMeasureColumnWidthItem
    | IWeakMeasureColumnWidthItem;
