// (C) 2020-2026 GoodData Corporation

import { GdcAdEventType } from "@gooddata/sdk-embedding";
import { type IDrillEvent } from "@gooddata/sdk-ui";

import { transformDrillEventToLegacy } from "../../utils/drilling/index.js";

import { adPostEvent } from "./post_event_helper.js";

export function drillPerformed(drillEvent: IDrillEvent): void {
    const transformed = transformDrillEventToLegacy(drillEvent);
    adPostEvent(GdcAdEventType.Drill, transformed);
}
