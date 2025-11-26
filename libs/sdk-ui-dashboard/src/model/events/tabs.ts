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

/**
 * Payload of the {@link DashboardTabCreated} event.
 * @alpha
 */
export interface DashboardTabCreatedPayload {
    /**
     * Identifier of the newly created tab.
     */
    readonly newTabId: string;
    /**
     * Index at which the new tab was inserted.
     */
    readonly index: number;
}

/**
 * This event is emitted when a dashboard tab is created.
 *
 * @alpha
 */
export interface DashboardTabCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.CREATED";
    readonly payload: DashboardTabCreatedPayload;
}

/**
 * Creates the DashboardTabCreated event.
 *
 * @param ctx - dashboard context
 * @param newTabId - identifier of the newly created tab
 * @param index - index at which the new tab was inserted
 * @param correlationId - correlation id to use for this event
 * @returns dashboard tab created event
 *
 * @alpha
 */
export function dashboardTabCreated(
    ctx: DashboardContext,
    newTabId: string,
    index: number,
    correlationId?: string,
): DashboardTabCreated {
    return {
        type: "GDC.DASH/EVT.TAB.CREATED",
        ctx,
        correlationId,
        payload: {
            newTabId,
            index,
        },
    };
}

/**
 * Type guard that checks if an event is a DashboardTabCreated event.
 *
 * @alpha
 */
export const isDashboardTabCreated = (event: any): event is DashboardTabCreated =>
    event.type === "GDC.DASH/EVT.TAB.CREATED";

/**
 * Payload of the {@link DashboardTabConvertedFromDefault} event.
 * @alpha
 */
export interface DashboardTabConvertedFromDefaultPayload {
    /**
     * Identifier of the newly created tab.
     */
    readonly newTabId: string;
    /**
     * Index at which the new tab was inserted.
     */
    readonly index: number;
}

/**
 * This event is emitted when a default dashboard tab is converted to a regular tab.
 *
 * @alpha
 */
export interface DashboardTabConvertedFromDefault extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.CONVERTED_FROM_DEFAULT";
    readonly payload: DashboardTabConvertedFromDefaultPayload;
}

/**
 * Creates the DashboardTabConvertedFromDefault event.
 *
 * @param ctx - dashboard context
 * @param newTabId - identifier of the newly created tab
 * @param index - index at which the new tab was inserted
 * @param correlationId - correlation id to use for this event
 * @returns dashboard tab converted from default event
 *
 * @alpha
 */
export function dashboardTabConvertedFromDefault(
    ctx: DashboardContext,
    newTabId: string,
    index: number,
    correlationId?: string,
): DashboardTabConvertedFromDefault {
    return {
        type: "GDC.DASH/EVT.TAB.CONVERTED_FROM_DEFAULT",
        ctx,
        correlationId,
        payload: { newTabId, index },
    };
}

/**
 * Type guard that checks if an event is a DashboardTabConvertedFromDefault event.
 *
 * @param event - event to check
 * @returns true if the event is a DashboardTabConvertedFromDefault event
 *
 * @alpha
 */
export const isDashboardTabConvertedFromDefault = (event: any): event is DashboardTabConvertedFromDefault =>
    event.type === "GDC.DASH/EVT.TAB.CONVERTED_FROM_DEFAULT";

/**
 * Payload of the {@link DashboardTabDeleted} event.
 * @alpha
 */
export interface DashboardTabDeletedPayload {
    /**
     * Identifier of the deleted tab.
     */
    readonly deletedTabId: string;
    /**
     * Index from which the tab was deleted.
     */
    readonly previousIndex: number;
    /**
     * Identifier of the next active tab after deletion. Undefined if none selected.
     */
    readonly nextActiveTabId?: string;
}

/**
 * This event is emitted when a dashboard tab is deleted.
 *
 * @alpha
 */
export interface DashboardTabDeleted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.DELETED";
    readonly payload: DashboardTabDeletedPayload;
}

/**
 * Creates the DashboardTabDeleted event.
 *
 * @param ctx - dashboard context
 * @param deletedTabId - identifier of the deleted tab
 * @param previousIndex - index from which the tab was deleted
 * @param nextActiveTabId - identifier of the next active tab, if any
 * @param correlationId - correlation id to use for this event
 * @returns dashboard tab deleted event
 *
 * @alpha
 */
export function dashboardTabDeleted(
    ctx: DashboardContext,
    deletedTabId: string,
    previousIndex: number,
    nextActiveTabId?: string,
    correlationId?: string,
): DashboardTabDeleted {
    return {
        type: "GDC.DASH/EVT.TAB.DELETED",
        ctx,
        correlationId,
        payload: {
            deletedTabId,
            previousIndex,
            nextActiveTabId,
        },
    };
}

/**
 * Type guard that checks if an event is a DashboardTabDeleted event.
 *
 * @param event - event to check
 * @returns true if the event is a DashboardTabDeleted event
 *
 * @alpha
 */
export const isDashboardTabDeleted = (event: any): event is DashboardTabDeleted =>
    event.type === "GDC.DASH/EVT.TAB.DELETED";

/**
 * Payload of the {@link DashboardTabRenamingStarted} event.
 * @alpha
 */
export interface DashboardTabRenamingStartedPayload {
    /**
     * Identifier of the tab whose renaming has started.
     */
    readonly tabId: string;
}

/**
 * This event is emitted when renaming mode is started for a dashboard tab.
 * @alpha
 */
export interface DashboardTabRenamingStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.RENAME_MODE.STARTED";
    readonly payload: DashboardTabRenamingStartedPayload;
}

/**
 * Creates the DashboardTabRenamingStarted event.
 * @alpha
 */
export function dashboardTabRenamingStarted(
    ctx: DashboardContext,
    tabId: string,
    correlationId?: string,
): DashboardTabRenamingStarted {
    return {
        type: "GDC.DASH/EVT.TAB.RENAME_MODE.STARTED",
        ctx,
        correlationId,
        payload: { tabId },
    };
}

/**
 * Type guard for {@link DashboardTabRenamingStarted}.
 * @alpha
 */
export const isDashboardTabRenamingStarted = (event: any): event is DashboardTabRenamingStarted =>
    event.type === "GDC.DASH/EVT.TAB.RENAME_MODE.STARTED";

/**
 * Payload of the {@link DashboardTabRenamingCanceled} event.
 * @alpha
 */
export interface DashboardTabRenamingCanceledPayload {
    /**
     * Identifier of the tab whose renaming has been canceled.
     */
    readonly tabId: string;
}

/**
 * This event is emitted when renaming mode is canceled for a dashboard tab.
 * @alpha
 */
export interface DashboardTabRenamingCanceled extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.RENAME_MODE.CANCELED";
    readonly payload: DashboardTabRenamingCanceledPayload;
}

/**
 * Creates the DashboardTabRenamingCanceled event.
 * @alpha
 */
export function dashboardTabRenamingCanceled(
    ctx: DashboardContext,
    tabId: string,
    correlationId?: string,
): DashboardTabRenamingCanceled {
    return {
        type: "GDC.DASH/EVT.TAB.RENAME_MODE.CANCELED",
        ctx,
        correlationId,
        payload: { tabId },
    };
}

/**
 * Type guard for {@link DashboardTabRenamingCanceled}.
 * @alpha
 */
export const isDashboardTabRenamingCanceled = (event: any): event is DashboardTabRenamingCanceled =>
    event.type === "GDC.DASH/EVT.TAB.RENAME_MODE.CANCELED";

/**
 * Payload of the {@link DashboardTabRenamed} event.
 * @alpha
 */
export interface DashboardTabRenamedPayload {
    /**
     * Identifier of the tab that was renamed.
     */
    readonly tabId: string;
    /**
     * New title of the tab.
     */
    readonly title: string;
}

/**
 * This event is emitted when a dashboard tab is renamed.
 * @alpha
 */
export interface DashboardTabRenamed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.RENAMED";
    readonly payload: DashboardTabRenamedPayload;
}

/**
 * Creates the DashboardTabRenamed event.
 * @alpha
 */
export function dashboardTabRenamed(
    ctx: DashboardContext,
    tabId: string,
    title: string,
    correlationId?: string,
): DashboardTabRenamed {
    return {
        type: "GDC.DASH/EVT.TAB.RENAMED",
        ctx,
        correlationId,
        payload: { tabId, title },
    };
}

/**
 * Type guard for {@link DashboardTabRenamed}.
 * @alpha
 */
export const isDashboardTabRenamed = (event: any): event is DashboardTabRenamed =>
    event.type === "GDC.DASH/EVT.TAB.RENAMED";
