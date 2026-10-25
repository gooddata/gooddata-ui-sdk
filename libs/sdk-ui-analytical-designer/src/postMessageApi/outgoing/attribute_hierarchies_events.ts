// (C) 2023-2026 GoodData Corporation

import { type GdcAdCommandType, GdcAdEventType, type IAdAvailableCommands } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

/**
 * Emit an event to notify outer app that current attribute hierarchies were updated/deleted.
 *
 * Notes:
 * - Keep the whole report object in the event data to keep backward compatibility with parent app
 */
export function attributeHierarchyModified(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const attributeHierarchyModifiedBody: IAdAvailableCommands = { availableCommands };
    adPostEvent(
        GdcAdEventType.AttributeHierarchyModified,
        attributeHierarchyModifiedBody,
        postMessageContextId,
    );
}
