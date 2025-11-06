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

/**
 * Payload of the {@link DashboardTabRepositioned} event.
 * @alpha
 */
export interface DashboardTabRepositionedPayload {
    /**
     * Old index of the tab before the reposition.
     */
    readonly oldIndex: number;

    /**
     * New index of the tab after the reposition.
     */
    readonly newIndex: number;
}

/**
 * This event is emitted when a dashboard tab is repositioned.
 *
 * @alpha
 */
export interface DashboardTabRepositioned extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.REPOSITIONED";
    readonly payload: DashboardTabRepositionedPayload;
}

/**
 * Creates the DashboardTabRepositioned event.
 *
 * @param ctx - dashboard context
 * @param oldIndex - old index of the tab before the reposition
 * @param newIndex - new index of the tab after the reposition
 * @param correlationId - correlation id to use for this event
 * @returns dashboard tab repositioned event
 *
 * @alpha
 */
export function dashboardTabRepositioned(
    ctx: DashboardContext,
    oldIndex: number,
    newIndex: number,
    correlationId?: string,
): DashboardTabRepositioned {
    return {
        type: "GDC.DASH/EVT.TAB.REPOSITIONED",
        ctx,
        correlationId,
        payload: {
            oldIndex,
            newIndex,
        },
    };
}

/**
 * Type guard that checks if an event is a DashboardTabRepositioned event.
 *
 * @param event - event to check
 * @returns true if the event is a DashboardTabRepositioned event
 *
 * @alpha
 */
export const isDashboardTabRepositioned = (event: any): event is DashboardTabRepositioned =>
    event.type === "GDC.DASH/EVT.TAB.REPOSITIONED";
