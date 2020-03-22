// (C) 2020 GoodData Corporation

import { HTMLDOMElement, SVGDOMElement } from "../chart/highcharts/highchartsEntryPoint";

export type UnsafeInternals = any;

export interface IUnsafeDataLabels {
    width?: number;
    padding?: number;
    element?: HTMLDOMElement | SVGDOMElement;
}
