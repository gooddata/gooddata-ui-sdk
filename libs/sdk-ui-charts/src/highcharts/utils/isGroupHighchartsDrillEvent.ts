// (C) 2019 GoodData Corporation
import Highcharts from "../chart/highcharts/highchartsEntryPoint";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

export interface IHighchartsPointObject extends Highcharts.Point {
    drillIntersection: IDrillEventIntersectionElement[];
    z?: number; // is missing in HCH's interface
    value?: number; // is missing in HCH's interface
}

export function isGroupHighchartsDrillEvent(event: Highcharts.DrilldownEventObject) {
    return !!event.points;
}
