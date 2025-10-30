// (C) 2025 GoodData Corporation

import { IDashboardEvent } from "./base.js";
import { DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link DashboardTabSwitched} event.
 * @alpha
 */
export interface DashboardTabSwitchedPayload {
    /**
     * Identifier of the previously active tab (undefined if no tab was active).
     */
    readonly previousTabId: string | undefined;

    /**
     * Identifier of the newly active tab.
     */
    readonly newTabId: string;
}

/**
 * This event is emitted when the active dashboard tab is switched.
 *
 * @alpha
 */
export interface DashboardTabSwitched extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.SWITCHED";
    readonly payload: DashboardTabSwitchedPayload;
}

/**
 * Creates the DashboardTabSwitched event.
 *
 * @param ctx - dashboard context
 * @param previousTabId - identifier of the previously active tab
 * @param newTabId - identifier of the newly active tab
 * @param correlationId - correlation id to use for this event
 * @returns dashboard tab switched event
 *
 * @alpha
 */
export function dashboardTabSwitched(
    ctx: DashboardContext,
    previousTabId: string | undefined,
    newTabId: string,
    correlationId?: string,
): DashboardTabSwitched {
    return {
        type: "GDC.DASH/EVT.TAB.SWITCHED",
        ctx,
        correlationId,
        payload: {
            previousTabId,
            newTabId,
        },
    };
}

/**
 * Type guard that checks if an event is a DashboardTabSwitched event.
 *
 * @param event - event to check
 * @returns true if the event is a DashboardTabSwitched event
 *
 * @alpha
 */
export const isDashboardTabSwitched = (event: any): event is DashboardTabSwitched =>
    event.type === "GDC.DASH/EVT.TAB.SWITCHED";
