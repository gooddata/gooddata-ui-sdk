// (C) 2020 GoodData Corporation

import {
    ColorAxisOptions,
    DataLabelsOptionsObject,
    HTMLDOMElement,
    StackItemObject,
    SVGAttributes,
    SVGDOMElement,
} from "../chartTypes/_integration/highchartsEntryPoint";
import { IColorAssignment } from "@gooddata/sdk-ui";
import { IColorPalette } from "@gooddata/sdk-model";

/*
 * This file contains assorted types which we use instead of official Highcharts types. It may be that
 * highcharts did not have the typings at the point we were writing our integration OR we need to access
 * some stuff that the official typings do not declare (unsafe, evil stuff).
 *
 * Lot of history in this codebase. Some types went away and were replaced by Highchart types, some are
 * still hanging around because we need to investigate their usage and clear/delete as needed. Bottom line
 * none of these types are exposed through public API anymore.
 */

/**
 * Use this type instead of casting to `any` in order to access highchart internals.
 */
export type UnsafeInternals = any;

/**
 * Type used to access highchart's internals for data labels.
 */
export interface IUnsafeDataLabels {
    width?: number;
    padding?: number;
    element?: HTMLDOMElement | SVGDOMElement;
}

//
// TODO: investigate use of the types below, see if they can be erradicated
//

export interface IStackLabels {
    enabled?: boolean;
}

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

export interface IYAxisConfig {
    yAxis?: IHighChartAxis[];
}

export interface IStackMeasuresConfig {
    series?: ISeriesItem[];
    yAxis?: IHighChartAxis[];
}

export interface ISeriesDataItem {
    x?: number;
    y?: number;
    value?: number;
    name?: string;
}

export interface IStackItem {
    column0?: StackItemObject[];
    column?: ISeriesDataItem[];
}

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

export interface IPatternOptionsObject {
    path: SVGAttributes;
    width: number;
    height: number;
}

export interface IPatternObject {
    pattern: IPatternOptionsObject;
}

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

export interface ICategoryParent {
    name: string;
}

// since applying 'grouped-categories' plugin, 'category' type is replaced from string to object in highchart
export interface ICategory {
    name: string;
    parent?: ICategoryParent;
}

export interface ISeriesItemConfig {
    color: string;
    legendIndex: number;
    data?: any;
    name?: string;
    yAxis?: number;
    xAxis?: number;
    type?: string;
}

export interface IClientRect {
    width?: number;
    height?: number;
    left?: number;
    right?: number;
    x?: number;
    y?: number;
}

export interface IAxis {
    label: string;
    format?: string;
    opposite?: boolean;
    seriesIndices?: number[];
}
