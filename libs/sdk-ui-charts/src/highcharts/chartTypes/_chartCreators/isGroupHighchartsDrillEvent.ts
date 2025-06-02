// (C) 2019-2025 GoodData Corporation
import { Point, DrilldownEventObject } from "../../lib/index.js";
import { IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

export interface IHighchartsPointObject extends Point {
    drillIntersection: IDrillEventIntersectionElement[];
    z?: number; // is missing in HCH's interface
    value?: number; // is missing in HCH's interface
    isNullTarget?: boolean; // is missing in HCH's interface
    target?: number; // is missing in HCH's interface
}

export function isGroupHighchartsDrillEvent(event: DrilldownEventObject): boolean {
    return !!event.points;
}
