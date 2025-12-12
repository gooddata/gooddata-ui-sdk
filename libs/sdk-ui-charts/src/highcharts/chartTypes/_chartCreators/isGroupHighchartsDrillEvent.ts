// (C) 2019-2025 GoodData Corporation
import { type IDrillEventIntersectionElement } from "@gooddata/sdk-ui";

import { type DrilldownEventObject, type Point } from "../../lib/index.js";

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
