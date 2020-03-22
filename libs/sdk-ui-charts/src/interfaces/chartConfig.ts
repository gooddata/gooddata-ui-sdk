// (C) 2020 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { IHeaderPredicate, VisType } from "@gooddata/sdk-ui";
import {
    HTMLDOMElement,
    SVGAttributes,
    SVGDOMElement,
} from "../highcharts/chart/highcharts/highchartsEntryPoint";
import { ISeriesItem, IStackItem } from "../highcharts/Config";

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
