// (C) 2019-2025 GoodData Corporation

// because of this issue //Should be removed after this will be resolved https://github.com/highcharts/highcharts-react/issues/521
// We need split imports of types and Highcharts itself
// se ambient module for types
// we also need import Highcharts from "highcharts/esm/highcharts.js"; directly in code files because any reexport caused
// error/warning Cannot find type definition file for 'src/highcharts.js
import type HighchartsModules from "highcharts";

export type HChart = HighchartsModules.Chart;
export type HTMLDOMElement = HighchartsModules.HTMLDOMElement;
export type SVGDOMElement = HighchartsModules.SVGDOMElement;
export type SVGAttributes = HighchartsModules.SVGAttributes;
export type StackItemObject = HighchartsModules.StackItemObject;
export type DataLabelsOptionsObject = HighchartsModules.DataLabelsOptions;
export type ColorAxisOptions = HighchartsModules.ColorAxisOptions;
export type HighchartsOptions = HighchartsModules.Options;
export type Axis = HighchartsModules.Axis;
export type ExtremesObject = HighchartsModules.ExtremesObject;
export type ChartParallelAxesOptions = HighchartsModules.ChartParallelAxesOptions;
export type YAxisOptions = HighchartsModules.YAxisOptions;
export type XAxisOptions = HighchartsModules.XAxisOptions;
export type HighchartsResponsiveOptions = HighchartsModules.ResponsiveOptions;
export type SeriesPieOptions = HighchartsModules.SeriesPieOptions;
export type SeriesAreaOptions = HighchartsModules.SeriesAreaOptions;
export type SeriesBubbleOptions = HighchartsModules.SeriesBubbleOptions;
export type SeriesLineOptions = HighchartsModules.SeriesLineOptions;
export type SeriesWaterfallOptions = HighchartsModules.SeriesWaterfallOptions;
export type Series = HighchartsModules.Series;
export type TooltipPositionerPointObject = HighchartsModules.TooltipPositionerPointObject;
export type PointOptionsObject = HighchartsModules.PointOptionsObject;
export type CSSObject = HighchartsModules.CSSObject;
export type ColorAxisDataClassesOptions = HighchartsModules.ColorAxisDataClassesOptions;
export type Point = HighchartsModules.Point;
export type DrilldownEventObject = HighchartsModules.DrilldownEventObject;
export type ChartOptions = HighchartsModules.ChartOptions;
export type OptionsStackingValue = HighchartsModules.OptionsStackingValue;
export type PlotOptions = HighchartsModules.PlotOptions;
export type DataLabelsOptions = HighchartsModules.DataLabelsOptions;
export type WrapProceedFunction = HighchartsModules.WrapProceedFunction;
export type AxisLabelsFormatterCallbackFunction = HighchartsModules.AxisLabelsFormatterCallbackFunction;
