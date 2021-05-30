// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";

/**
 * @internal
 */
export type DashboardEventType =
    | "GDC.DASHBOARD.EVT.COMMAND.FAILED"
    | "GDC.DASHBOARD.EVT.COMMAND.REJECTED"
    | "GDC.DASHBOARD.EVT.D.LOADED"
    | "GDC.DASHBOARD.EVT.D.SAVED"
    | "GDC.DASHBOARD.EVT.D.COPY_SAVED"
    | "GDC.DASHBOARD.EVT.D.RENAMED"
    | "GDC.DASHBOARD.EVT.D.RESET"
    | "GDC.DASHBOARD.EVT.DF.VALIDATION.FAILED"
    | "GDC.DASHBOARD.EVT.DF.SELECTION_CHANGED"
    | "GDC.DASHBOARD.EVT.AF.ADDED"
    | "GDC.DASHBOARD.EVT.AF.REMOVED"
    | "GDC.DASHBOARD.EVT.AF.MOVED"
    | "GDC.DASHBOARD.EVT.AF.SELECTION_CHANGED"
    | "GDC.DASHBOARD.EVT.AF.PARENT_CHANGED"
    | "GDC.DASHBOARD.EVT.F.FILTER_CONTEXT_CHANGED"
    | "GDC.DASHBOARD.EVT.L.SECTION_ADDED"
    | "GDC.DASHBOARD.EVT.L.SECTION_MOVED"
    | "GDC.DASHBOARD.EVT.L.SECTION_REMOVED"
    | "GDC.DASHBOARD.EVT.L.SECTION_HEADER_CHANGED"
    | "GDC.DASHBOARD.EVT.L.ITEMS_ADDED"
    | "GDC.DASHBOARD.EVT.L.ITEM_MOVED"
    | "GDC.DASHBOARD.EVT.L.ITEM_REMOVED"
    | "GDC.DASHBOARD.EVT.L.LAYOUT_CHANGED";

/**
 * Base type for all dashboard events.
 *
 * @internal
 */
export interface IDashboardEvent {
    /**
     * Event type. Always starts with "GDC.DASHBOARD.EVT".
     */
    readonly type: DashboardEventType;

    /**
     * If this event was triggered as part of a command processing, then the prop will contain command's correlation ID.
     */
    readonly correlationId?: string;

    /**
     * Dashboard context in which the event occurred.
     */
    readonly ctx: DashboardContext;
}
