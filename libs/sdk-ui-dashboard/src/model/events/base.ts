// (C) 2021 GoodData Corporation
import { DashboardContext } from "../types/commonTypes";

/**
 * @internal
 */
export type DashboardEventType =
    | "GDC.DASH/EVT.COMMAND.FAILED"
    | "GDC.DASH/EVT.COMMAND.REJECTED"
    | "GDC.DASH/EVT.LOADED"
    | "GDC.DASH/EVT.SAVED"
    | "GDC.DASH/EVT.COPY_SAVED"
    | "GDC.DASH/EVT.RENAMED"
    | "GDC.DASH/EVT.RESET"
    | "GDC.DASH/EVT.DATE_FILTER.VALIDATION.FAILED"
    | "GDC.DASH/EVT.DATE_FILTER.SELECTION_CHANGED"
    | "GDC.DASH/EVT.ATTRIBUTE_FILTER.ADDED"
    | "GDC.DASH/EVT.ATTRIBUTE_FILTER.REMOVED"
    | "GDC.DASH/EVT.ATTRIBUTE_FILTER.MOVED"
    | "GDC.DASH/EVT.ATTRIBUTE_FILTER.SELECTION_CHANGED"
    | "GDC.DASH/EVT.ATTRIBUTE_FILTER.PARENT_CHANGED"
    | "GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED";

/**
 * Base type for all dashboard events.
 *
 * @internal
 */
export interface IDashboardEvent {
    /**
     * Event type. Always starts with "GDC.DASH/EVT".
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
