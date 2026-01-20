// (C) 2025-2026 GoodData Corporation

import { type IDashboardEvent } from "./base.js";
import { type DashboardContext } from "../types/commonTypes.js";

/**
 * Payload of the {@link IDashboardTabSwitched} event.
 * @alpha
 */
export interface IDashboardTabSwitchedPayload {
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
export interface IDashboardTabSwitched extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.SWITCHED";
    readonly payload: IDashboardTabSwitchedPayload;
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
): IDashboardTabSwitched {
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
export const isDashboardTabSwitched = (event: any): event is IDashboardTabSwitched =>
    event.type === "GDC.DASH/EVT.TAB.SWITCHED";

/**
 * Payload of the {@link IDashboardTabRepositioned} event.
 * @alpha
 */
export interface IDashboardTabRepositionedPayload {
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
export interface IDashboardTabRepositioned extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.REPOSITIONED";
    readonly payload: IDashboardTabRepositionedPayload;
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
): IDashboardTabRepositioned {
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
export const isDashboardTabRepositioned = (event: any): event is IDashboardTabRepositioned =>
    event.type === "GDC.DASH/EVT.TAB.REPOSITIONED";

/**
 * Payload of the {@link IDashboardTabCreated} event.
 * @alpha
 */
export interface IDashboardTabCreatedPayload {
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
export interface IDashboardTabCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.CREATED";
    readonly payload: IDashboardTabCreatedPayload;
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
): IDashboardTabCreated {
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
export const isDashboardTabCreated = (event: any): event is IDashboardTabCreated =>
    event.type === "GDC.DASH/EVT.TAB.CREATED";

/**
 * Payload of the {@link IDashboardTabConvertedFromDefault} event.
 * @alpha
 */
export interface IDashboardTabConvertedFromDefaultPayload {
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
export interface IDashboardTabConvertedFromDefault extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.CONVERTED_FROM_DEFAULT";
    readonly payload: IDashboardTabConvertedFromDefaultPayload;
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
): IDashboardTabConvertedFromDefault {
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
export const isDashboardTabConvertedFromDefault = (event: any): event is IDashboardTabConvertedFromDefault =>
    event.type === "GDC.DASH/EVT.TAB.CONVERTED_FROM_DEFAULT";

/**
 * Payload of the {@link IDashboardTabDeleted} event.
 * @alpha
 */
export interface IDashboardTabDeletedPayload {
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
export interface IDashboardTabDeleted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.DELETED";
    readonly payload: IDashboardTabDeletedPayload;
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
): IDashboardTabDeleted {
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
export const isDashboardTabDeleted = (event: any): event is IDashboardTabDeleted =>
    event.type === "GDC.DASH/EVT.TAB.DELETED";

/**
 * Payload of the {@link IDashboardTabRenamingStarted} event.
 * @alpha
 */
export interface IDashboardTabRenamingStartedPayload {
    /**
     * Identifier of the tab whose renaming has started.
     */
    readonly tabId: string;
}

/**
 * This event is emitted when renaming mode is started for a dashboard tab.
 * @alpha
 */
export interface IDashboardTabRenamingStarted extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.RENAME_MODE.STARTED";
    readonly payload: IDashboardTabRenamingStartedPayload;
}

/**
 * Creates the DashboardTabRenamingStarted event.
 * @alpha
 */
export function dashboardTabRenamingStarted(
    ctx: DashboardContext,
    tabId: string,
    correlationId?: string,
): IDashboardTabRenamingStarted {
    return {
        type: "GDC.DASH/EVT.TAB.RENAME_MODE.STARTED",
        ctx,
        correlationId,
        payload: { tabId },
    };
}

/**
 * Type guard for {@link IDashboardTabRenamingStarted}.
 * @alpha
 */
export const isDashboardTabRenamingStarted = (event: any): event is IDashboardTabRenamingStarted =>
    event.type === "GDC.DASH/EVT.TAB.RENAME_MODE.STARTED";

/**
 * Payload of the {@link IDashboardTabRenamingCanceled} event.
 * @alpha
 */
export interface IDashboardTabRenamingCanceledPayload {
    /**
     * Identifier of the tab whose renaming has been canceled.
     */
    readonly tabId: string;
}

/**
 * This event is emitted when renaming mode is canceled for a dashboard tab.
 * @alpha
 */
export interface IDashboardTabRenamingCanceled extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.RENAME_MODE.CANCELED";
    readonly payload: IDashboardTabRenamingCanceledPayload;
}

/**
 * Creates the DashboardTabRenamingCanceled event.
 * @alpha
 */
export function dashboardTabRenamingCanceled(
    ctx: DashboardContext,
    tabId: string,
    correlationId?: string,
): IDashboardTabRenamingCanceled {
    return {
        type: "GDC.DASH/EVT.TAB.RENAME_MODE.CANCELED",
        ctx,
        correlationId,
        payload: { tabId },
    };
}

/**
 * Type guard for {@link IDashboardTabRenamingCanceled}.
 * @alpha
 */
export const isDashboardTabRenamingCanceled = (event: any): event is IDashboardTabRenamingCanceled =>
    event.type === "GDC.DASH/EVT.TAB.RENAME_MODE.CANCELED";

/**
 * Payload of the {@link IDashboardTabRenamed} event.
 * @alpha
 */
export interface IDashboardTabRenamedPayload {
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
export interface IDashboardTabRenamed extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TAB.RENAMED";
    readonly payload: IDashboardTabRenamedPayload;
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
): IDashboardTabRenamed {
    return {
        type: "GDC.DASH/EVT.TAB.RENAMED",
        ctx,
        correlationId,
        payload: { tabId, title },
    };
}

/**
 * Type guard for {@link IDashboardTabRenamed}.
 * @alpha
 */
export const isDashboardTabRenamed = (event: any): event is IDashboardTabRenamed =>
    event.type === "GDC.DASH/EVT.TAB.RENAMED";
