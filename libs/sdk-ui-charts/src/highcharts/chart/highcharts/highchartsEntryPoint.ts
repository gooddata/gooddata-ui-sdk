// (C) 2019-2020 GoodData Corporation
// Have only one entrypoint to highcharts and drill module
// Import this reexported variable in other files instead of direct import from highcharts
import Highcharts from "highcharts";

export type HTMLDOMElement = Highcharts.HTMLDOMElement;
export type SVGDOMElement = Highcharts.SVGDOMElement;
export type SVGAttributes = Highcharts.SVGAttributes;
export type StackItemObject = Highcharts.StackItemObject;
export type DataLabelsOptionsObject = Highcharts.DataLabelsOptionsObject;
export type ColorAxisOptions = Highcharts.ColorAxisOptions;

export default Highcharts;
