// (C) 2007-2020 GoodData Corporation

import {
    ColorAxisOptions,
    DataLabelsOptionsObject,
    StackItemObject,
    SVGAttributes,
} from "./chart/highcharts/highchartsEntryPoint";
import { IColorPalette } from "@gooddata/sdk-model";
import { IColorAssignment } from "@gooddata/sdk-ui";
import { IHighChartAxis } from "../interfaces";

/**
 * TODO: SDK8: add docs
 * @internal
 */
export interface IStackMeasuresConfig {
    series?: ISeriesItem[];
    yAxis?: IHighChartAxis[];
}

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
