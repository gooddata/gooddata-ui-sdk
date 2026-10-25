// (C) 2020-2026 GoodData Corporation

import { GdcAdEventType } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function listeningForDrillableItems(): void {
    adPostEvent(GdcAdEventType.ListeningForDrillableItems, {});
}
