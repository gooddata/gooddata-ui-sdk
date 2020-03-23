// (C) 2020 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { IHeaderPredicate, VisType } from "@gooddata/sdk-ui";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IChartConfig {
    type?: VisType;
    colors?: string[];
    colorPalette?: IColorPalette;
    colorMapping?: IColorMapping[];
    legend?: ILegendConfig;
    legendLayout?: string;
    limits?: IChartLimits;
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
    stacking?: boolean;
    stackMeasures?: boolean;
    stackMeasuresToPercent?: boolean;
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
export interface IColorMapping {
    // sent to SDK
    predicate: IHeaderPredicate;
    color: IColor;
}

export type AxisNamePosition = "high" | "low" | "middle";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IAxisNameConfig {
    visible?: boolean;
    position?: AxisNamePosition;
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
    name?: IAxisNameConfig;
}
