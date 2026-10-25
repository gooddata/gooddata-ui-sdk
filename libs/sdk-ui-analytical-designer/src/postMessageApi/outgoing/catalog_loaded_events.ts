// (C) 2026 GoodData Corporation

import { type AdCatalogLoadedBody, type GdcAdCommandType, GdcAdEventType } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

/**
 * Emit an event to notify outer app that the catalog is loaded.
 */
export function catalogLoaded(availableCommands: GdcAdCommandType[]): void {
    const data: AdCatalogLoadedBody = {
        availableCommands,
    };
    adPostEvent(GdcAdEventType.CatalogLoaded, data);
}
