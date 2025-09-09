// (C) 2020-2025 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";
import { IColorAssignment } from "@gooddata/sdk-ui";
import { ChartFillConfig } from "@gooddata/sdk-ui-vis-commons";

import { ChartAlignTypes, IAxisConfig, IGridConfig } from "../../interfaces/index.js";
import { StackingType } from "../constants/stacking.js";
import {
    ColorAxisOptions,
    DataLabelsOptionsObject,
    HTMLDOMElement,
    SVGAttributes,
    SVGDOMElement,
    StackItemObject,
    TooltipPositionerPointObject,
    YAxisOptions,
} from "../lib/index.js";

/*
 * This file contains mixed types which:
 * - we use instead of official Highcharts types. It may be that
 * highcharts did not have the typings at the point we were writing our integration OR we need to access
 * some stuff that the official typings do not declare (unsafe, evil stuff). Such type should be named `IUnsafe...`
 * - types used for IChartOptions - intermediate phase of IChartConfig to HighchartsOptions conversion. It is product of getChartOptions and input for getHighchartsOptions which finally produces HighchartsOptions provided to the HCH
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
    AXIS_LINE_COLOR?: string;
    categories?: string[];
    opposite?: boolean;
    stackLabels?: IStackLabels;
    defaultFormat?: string;
    gridLineColor?: string;
    gridLineWidth?: number;
    min?: number;
    max?: number;
    visible?: boolean;
}

export interface IYAxisConfig {
    yAxis?: IHighChartAxis[] | YAxisOptions[];
}

export interface IStackMeasuresConfig {
    series?: ISeriesItem[];
    yAxis?: IHighChartAxis[] | YAxisOptions[];
}

export interface ISeriesDataItem {
    x?: number;
    y?: number;
    low?: number;
    high?: number;
    value?: number;
    name?: string;
    legendIndex?: number;
    color?: TooltipPositionerPointObject["color"];
    from?: string;
    to?: string;
    weight?: number;
    isSum?: boolean;
    isIntermediateSum?: boolean;
    visible?: boolean;
    format?: string;
    borderColor?: string;
    loading?: boolean;
}

export interface ISeriesNodeItem {
    id?: string;
    color?: string;
}

export interface IStackItem {
    column0?: StackItemObject[];
    column?: ISeriesDataItem[];
}

export interface IZone {
    value?: number;
    dashStyle?: "solid" | "shortDash";
    color?: IPatternObject;
}

export interface ISeriesItem {
    name?: string;
    segmentName?: string;
    clusterName?: string;
    keys?: string[];
    data?: ISeriesDataItem[];
    color?: string | IPatternObject;
    lineColor?: string;
    borderColor?: string;
    lineWidth?: number;
    userOptions?: any;
    visible?: boolean;
    type?: string;
    isDrillable?: boolean;
    legendIndex?: number;
    seriesIndex?: number;
    yAxis?: number;
    zIndex?: number;
    labelKey?: string;
    stack?: number;
    stacking?: StackingType;
    dataLabels?: DataLabelsOptionsObject;
    dataLabelsGroup?: SVGAttributes;
    nodes?: ISeriesNodeItem[];
    dashStyle?: "dash";
    showInLegend?: boolean;
    marker?: {
        enabled?: boolean;
    };
    zoneAxis?: "x" | "y";
    zones?: IZone[];
}

export interface IChartOptionsData {
    series?: any[];
    categories?: string[][];
}

export type ITooltipFactory = (
    point: IUnsafeHighchartsTooltipPoint,
    maxTooltipContentWidth: number,
    percentageValue?: number,
) => string;

export interface IChartOptions {
    type?: string;
    stacking?: StackingType;
    hasStackByAttribute?: boolean;
    hasViewByAttribute?: boolean;
    isViewByTwoAttributes?: boolean;
    legendLayout?: string;
    xAxes?: IAxis[];
    yAxes?: IAxis[];
    data?: IChartOptionsData;
    actions?: {
        tooltip: ITooltipFactory;
    };
    grid?: IGridConfig;
    xAxisProps?: IAxisConfig;
    yAxisProps?: IAxisConfig;
    secondary_xAxisProps?: IAxisConfig;
    secondary_yAxisProps?: IAxisConfig;
    title?: {
        x: string;
        y: string;
        format: string;
    };
    colorAxis?: ColorAxisOptions;
    colorAssignments?: IColorAssignment[];
    colorPalette?: IColorPalette;
    forceDisableDrillOnAxes?: boolean;
    verticalAlign?: ChartAlignTypes;
    legendLabel?: string;
    chartFill?: ChartFillConfig;
}

export interface IPatternOptionsObject {
    path: SVGAttributes;
    width: number;
    height: number;
    color?: string;
    opacity?: number;
}

export interface IPatternObject {
    pattern: IPatternOptionsObject;
}

export interface IUnsafeTooltipPositionerPointObject extends TooltipPositionerPointObject {
    // real object contains these keys, but HCH type not and we are using them
    h?: number;
    negative?: boolean;
}
export interface IPointData {
    /**
     * Custom properties set by custom data options.
     */
    [property: string]: any;
    negative?: boolean;
    h?: number;

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

// This type is used for data points provided from HCH to the callbacks, eg. tooltips - HCH dont export its interface
export interface IUnsafeHighchartsTooltipPoint {
    /**
     * Custom properties set by custom data options.
     */
    [property: string]: any;

    x?: number;
    y?: number;
    z?: number;
    target?: number;
    value?: number;
    format?: string;
    marker?: {
        enabled: boolean;
    };
    name?: string;
    color?: TooltipPositionerPointObject["color"];
    legendIndex?: number;
    id?: string;
    parent?: string;
    drilldown?: boolean;
    drillIntersection?: any;
    borderWidth?: number;
    borderColor?: string;
    pointPadding?: number;
    series?: {
        name?: string;
        data?: any[];
        points?: any[];
        xAxis?: any;
        xData?: number[];
        yAxis?: {
            opposite: boolean;
        };
        yData?: number[];
        userOptions?: any;
    };
    category?: ICategory;
    node?: {
        isLeaf: boolean;
    };
    isNode?: boolean;
    from?: string;
    to?: string;
    weight?: number;
    sum?: number;
    low?: number;
    high?: number;
}

export interface ICategoryParent {
    name: string;
    leaves?: number;
    categories?: string[];
}

// since applying 'grouped-categories' plugin, 'category' type is replaced from string to object in highchart
export interface ICategory {
    name: string;
    parent?: ICategoryParent;
    userOptions?: any;
}

export interface ISeriesItemConfig {
    legendIndex: number;
    seriesIndex: number;
    upColor?: string;
    color?: string | IPatternObject;
    fillColor?: string | IPatternObject;
    borderColor?: string;
    data?: IPointData;
    name?: string;
    yAxis?: number;
    xAxis?: number;
    type?: string;
    turboThreshold?: number;
    dataLabels?: any;
}

export interface IAxis {
    label: string;
    format?: string;
    opposite?: boolean;
    seriesIndices?: number[];
    plotLines?: number[];
}
