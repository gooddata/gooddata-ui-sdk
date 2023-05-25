// (C) 2019-2020 GoodData Corporation
import Highcharts from "../../lib/index.js";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

export interface IHighchartsPointObject extends Highcharts.Point {
    drillIntersection: IDrillEventIntersectionElement[];
    z?: number; // is missing in HCH's interface
    value?: number; // is missing in HCH's interface
    isNullTarget?: boolean; // is missing in HCH's interface
    target?: number; // is missing in HCH's interface
    ignoredInDrillEventContext?: boolean; // is missing in HCH's interface
}

export function isGroupHighchartsDrillEvent(event: Highcharts.DrilldownEventObject): boolean {
    return !!event.points;
}
