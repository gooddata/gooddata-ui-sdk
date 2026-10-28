// (C) 2020-2026 GoodData Corporation

import { GdcAdEventType } from "@gooddata/sdk-embedding";
import { type IDrillEvent } from "@gooddata/sdk-ui";

import { getHostAdapter } from "../../embedding/hostBridge.js";
import { transformDrillEventToLegacy } from "../../utils/drilling/index.js";

import { postHostEvent, postWindowEvent } from "./post_event_helper.js";

export function drillPerformed(drillEvent: IDrillEvent): void {
    // A host component receives the drill event of @gooddata/sdk-ui; the postMessage contract carries
    // the legacy shape.
    const hostAdapter = getHostAdapter();
    if (hostAdapter) {
        postHostEvent(hostAdapter, GdcAdEventType.Drill, drillEvent);
        return;
    }
    postWindowEvent(GdcAdEventType.Drill, transformDrillEventToLegacy(drillEvent));
}
