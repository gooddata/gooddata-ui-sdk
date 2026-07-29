// (C) 2026 GoodData Corporation

import type { MouseEvent } from "react";

import type { ICatalogItem } from "../catalogItem/types.js";

import type { OpenHandlerEvent } from "./types.js";

/** @internal */
export function toOpenHandlerEvent(
    event: MouseEvent,
    item: ICatalogItem,
    workspaceId: string,
): OpenHandlerEvent {
    return {
        item,
        workspaceId,
        newTab: event.metaKey || event.ctrlKey,
        preventDefault: event.preventDefault.bind(event),
    };
}
