import Highcharts from "../chart/highcharts/highchartsEntryPoint";
import { IDrillEventIntersectionElement } from "../../interfaces/DrillEvents";

export interface IHighchartsPointObject extends Highcharts.Point {
    drillIntersection: IDrillEventIntersectionElement[];
    z?: number; // is missing in HCH's interface
    value?: number; // is missing in HCH's interface
}

export function isGroupHighchartsDrillEvent(event: Highcharts.DrilldownEventObject) {
    return !!event.points;
}
