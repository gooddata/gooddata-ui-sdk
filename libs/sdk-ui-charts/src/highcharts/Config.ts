// (C) 2007-2020 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import {
    ColorAxisOptions,
    DataLabelsOptionsObject,
    HTMLDOMElement,
    StackItemObject,
    SVGAttributes,
    SVGDOMElement,
} from "./chart/highcharts/highchartsEntryPoint";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { IHeaderPredicate, IColorAssignment, VisType } from "@gooddata/sdk-ui";
export { DefaultColorPalette } from "@gooddata/sdk-ui";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IChartConfig extends IMeasuresStackConfig {
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    type?: VisType;
    legend?: ILegendConfig;
    legendLayout?: string;
    limits?: IChartLimits;
    stacking?: boolean;
    grid?: any;
    yFormat?: string;
    yLabel?: string;
    xFormat?: string;
    xLabel?: string;
    chart?: any;
    xaxis?: IAxisConfig;
    yaxis?: IAxisConfig;
    secondary_xaxis?: IAxisConfig;
    secondary_yaxis?: IAxisConfig;
    separators?: ISeparators;
    dataLabels?: IDataLabelsConfig;
    dualAxis?: boolean;
    primaryChartType?: string;
    secondaryChartType?: string;
    forceDisableDrillOnAxes?: boolean;
    disableDrillUnderline?: boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type PositionType = "left" | "right" | "top" | "bottom" | "auto";

/**
 * TODO: SDK8: add docs
 * @public
 */
export type IDataLabelsVisible = string | boolean;

/**
 * TODO: SDK8: add docs
 * @public
 */
export type ChartAlignTypes = "top" | "bottom" | "middle";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IDataLabelsConfig {
    visible?: IDataLabelsVisible;
    width?: number;
    padding?: number;
    element?: HTMLDOMElement | SVGDOMElement;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface ILegendConfig {
    enabled?: boolean;
    position?: PositionType;
    responsive?: boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IChartLimits {
    series?: number;
    categories?: number;
    dataPoints?: number;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IMeasuresStackConfig {
    stackMeasures?: boolean;
    stackMeasuresToPercent?: boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IColorMapping {
    // sent to SDK
    predicate: IHeaderPredicate;
    color: IColor;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IStackLabels {
    enabled?: boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IHighChartAxis {
    AXIS_LINE_COLOR: string;
    categories: string[];
    opposite: boolean;
    stackLabels: IStackLabels;
    defaultFormat?: string;
    gridLineColor?: string;
    gridLineWidth?: number;
    min?: number;
    max?: number;
    visible?: boolean;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IYAxisConfig {
    yAxis?: IHighChartAxis[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IStackMeasuresConfig {
    series?: ISeriesItem[];
    yAxis?: IHighChartAxis[];
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IAxisNameConfig {
    visible?: boolean;
    position?: Highcharts.AxisTitleAlignValue;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IAxisConfig {
    visible?: boolean;
    labelsEnabled?: boolean;
    rotation?: string;
    min?: string;
    max?: string;
    measures?: string[];
    stacks?: IStackItem;
    series?: ISeriesItem[];
    stackTotalGroup?: SVGAttributes;
    name?: IAxisNameConfig;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IAxis {
    label: string;
    format?: string;
    opposite?: boolean;
    seriesIndices?: number[];
}

//
// Internals. TODO: move them out of here
//

/**
 * @internal
 */
export interface ISeriesDataItem {
    x?: number;
    y: number;
    value?: number;
    name?: string;
}

/**
 * @internal
 */
export interface IStackItem {
    column0?: StackItemObject[];
    column?: ISeriesDataItem[];
}

/**
 * @internal
 */
export interface ISeriesItem {
    name?: string;
    data?: ISeriesDataItem[];
    color?: string;
    userOptions?: any;
    visible?: boolean;
    type?: string;
    isDrillable?: boolean;
    legendIndex?: number;
    yAxis?: number;
    zIndex?: number;
    labelKey?: string;
    stack?: number;
    stacking?: string;
    dataLabels?: DataLabelsOptionsObject;
    dataLabelsGroup?: SVGAttributes;
}

/**
 * @internal
 */
export interface IChartOptions {
    type?: string;
    stacking?: string;
    hasStackByAttribute?: boolean;
    hasViewByAttribute?: boolean;
    isViewByTwoAttributes?: boolean;
    legendLayout?: string;
    xAxes?: any;
    yAxes?: any;
    data?: any;
    actions?: any;
    grid?: any;
    xAxisProps?: any;
    yAxisProps?: any;
    secondary_xAxisProps?: any;
    secondary_yAxisProps?: any;
    title?: any;
    colorAxis?: ColorAxisOptions;
    colorAssignments?: IColorAssignment[];
    colorPalette?: IColorPalette;
    forceDisableDrillOnAxes?: boolean;
}

/**
 * @internal
 */
export interface IPatternOptionsObject {
    path: SVGAttributes;
    width: number;
    height: number;
}

/**
 * @internal
 */
export interface IPatternObject {
    pattern: IPatternOptionsObject;
}

/**
 * @internal
 */
export interface IPointData {
    /**
     * Custom properties set by custom data options.
     */
    [property: string]: any;
    x?: number;
    y?: number;
    z?: number;
    value?: number;
    format?: string;
    marker?: {
        enabled: boolean;
    };
    name?: string;
    color?: string | IPatternObject;
    legendIndex?: number;
    id?: string;
    parent?: string;
    drilldown?: boolean;
    drillIntersection?: any;
    borderWidth?: number;
    borderColor?: string;
    pointPadding?: number;
    series?: ISeriesItem;
    category?: ICategory;
}

/**
 * @internal
 */
export interface ICategoryParent {
    name: string;
}

// since applying 'grouped-categories' plugin, 'category' type is replaced from string to object in highchart
/**
 * @internal
 */
export interface ICategory {
    name: string;
    parent?: ICategoryParent;
}

/**
 * @internal
 */
export interface ISeriesItemConfig {
    color: string;
    legendIndex: number;
    data?: any;
    name?: string;
    yAxis?: number;
    xAxis?: number;
}

/**
 * @internal
 */
export interface IClientRect {
    width?: number;
    height?: number;
    left?: number;
    right?: number;
    x?: number;
    y?: number;
}
