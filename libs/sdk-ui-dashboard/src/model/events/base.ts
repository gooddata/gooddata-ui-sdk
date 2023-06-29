// (C) 2021-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { DashboardContext } from "../types/commonTypes.js";

/**
 * A union of all available built-in dashboard event type names.
 *
 * @remarks
 * Note: while this type is marked as public most of the event types are currently an alpha-level API that
 * we reserve to change in the following releases.
 *
 * These are the event types that we currently consider stable:
 *
 * -  GDC.DASH/EVT.INITIALIZED
 * -  GDC.DASH/EVT.DEINITIALIZED
 * -  GDC.DASH/EVT.SAVED
 * -  GDC.DASH/EVT.COPY_SAVED
 * -  GDC.DASH/EVT.SHARING.CHANGED
 * -  GDC.DASH/EVT.FILTER_CONTEXT.CHANGED
 * -  GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED
 * -  GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED
 *
 * @public
 */
export type DashboardEventType =
    | "GDC.DASH/EVT.COMMAND.FAILED"
    | "GDC.DASH/EVT.COMMAND.REJECTED"
    | "GDC.DASH/EVT.COMMAND.STARTED"
    | "GDC.DASH/EVT.QUERY.FAILED"
    | "GDC.DASH/EVT.QUERY.REJECTED"
    | "GDC.DASH/EVT.QUERY.STARTED"
    | "GDC.DASH/EVT.QUERY.COMPLETED"
    | "GDC.DASH/EVT.USER_INTERACTION.TRIGGERED"
    | "GDC.DASH/EVT.INITIALIZED"
    | "GDC.DASH/EVT.DEINITIALIZED"
    | "GDC.DASH/EVT.SAVED"
    | "GDC.DASH/EVT.COPY_SAVED"
    | "GDC.DASH/EVT.RENAMED"
    | "GDC.DASH/EVT.RESET"
    | "GDC.DASH/EVT.DELETED"
    | "GDC.DASH/EVT.RENDER_MODE.CHANGED"
    | "GDC.DASH/EVT.EXPORT.PDF.REQUESTED"
    | "GDC.DASH/EVT.EXPORT.PDF.RESOLVED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.VALIDATION.FAILED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.DATE_FILTER.SELECTION_CHANGED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADDED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_CHANGED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.PARENT_CHANGED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.DISPLAY_FORM_CHANGED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.SELECTION_MODE_CHANGED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.ATTRIBUTE_FILTER.TITLE_CHANGED"
    | "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEM_WIDTH_RESIZED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEMS_HEIGHT_RESIZED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION"
    | "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED"
    | "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.HEADER_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.DESCRIPTION_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.CONFIGURATION_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.COMPARISON_CHANGED"
    | "GDC.DASH/EVT.KPI_WIDGET.DRILL_REMOVED"
    | "GDC.DASH/EVT.KPI_WIDGET.DRILL_SET"
    | "GDC.DASH/EVT.KPI_WIDGET.WIDGET_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.HEADER_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.DESCRIPTION_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.PROPERTIES_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.CONFIGURATION_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_MODIFIED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.DRILLS_REMOVED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.WIDGET_CHANGED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_REQUESTED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.EXPORT_RESOLVED"
    | "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED"
    | "GDC.DASH/EVT.WIDGET.EXECUTION_STARTED"
    | "GDC.DASH/EVT.WIDGET.EXECUTION_FAILED"
    | "GDC.DASH/EVT.WIDGET.EXECUTION_SUCCEEDED"
    | "GDC.DASH/EVT.ALERT.CREATED"
    | "GDC.DASH/EVT.ALERT.UPDATED"
    | "GDC.DASH/EVT.ALERTS.REMOVED"
    | "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED"
    | "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED"
    | "GDC.DASH/EVT.DRILL.REQUESTED"
    | "GDC.DASH/EVT.DRILL.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILL_DOWN.REQUESTED"
    | "GDC.DASH/EVT.DRILL.DRILL_DOWN.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.REQUESTED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_INSIGHT.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.REQUESTED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.REQUESTED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_ATTRIBUTE_URL.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.REQUESTED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.REQUESTED"
    | "GDC.DASH/EVT.DRILL.DRILL_TO_LEGACY_DASHBOARD.RESOLVED"
    | "GDC.DASH/EVT.DRILL.DRILLABLE_ITEMS.CHANGED"
    | "GDC.DASH/EVT.DRILL_TARGETS.ADDED"
    | "GDC.DASH/EVT.RENDER.REQUESTED"
    | "GDC.DASH/EVT.RENDER.ASYNC.REQUESTED"
    | "GDC.DASH/EVT.RENDER.ASYNC.RESOLVED"
    | "GDC.DASH/EVT.RENDER.RESOLVED"
    | "GDC.DASH/EVT.SHARING.CHANGED"
    | "GDC.DASH/EVT.CREATE_INSIGHT_REQUESTED";

/**
 * Base type for all dashboard events.
 *
 * @typeParam TPayload - type of the event's additional data
 * @public
 */
export interface IDashboardEvent<TPayload = any> {
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

    /**
     * Specify any additional data the custom event needs.
     */
    readonly payload?: TPayload;

    /**
     * Metadata about the event useful for logging and handling of the event.
     */
    readonly meta?: {
        /**
         * When the event was accepted by the Dashboard store and emitted.
         */
        acceptedTimestamp: number;
    };
}

/**
 * Tests whether object is an instance of {@link IDashboardEvent}.
 *
 * @param obj - object to test
 * @public
 */
export function isDashboardEvent(obj: unknown): obj is IDashboardEvent {
    return !isEmpty(obj) && (obj as IDashboardEvent).type?.startsWith("GDC.DASH/EVT");
}

/**
 * Base type for all custom events.
 *
 * @typeParam TPayload - type of the event's additional data
 * @public
 */
export interface ICustomDashboardEvent<TPayload = any> {
    /**
     * Event type. Always starts with "CUSTOM/EVT".
     */
    readonly type: string;

    /**
     * Dashboard context in which the event occurred.
     */
    readonly ctx: DashboardContext;

    /**
     * Specify any additional data the custom event needs.
     */
    readonly payload?: TPayload;

    /**
     * Metadata about the event useful for logging and handling of the event.
     */
    readonly meta?: {
        /**
         * When the event was accepted by the Dashboard store and emitted.
         */
        acceptedTimestamp: number;
    };
}

/**
 * Tests whether object is an instance of {@link ICustomDashboardEvent}.
 *
 * @param obj - object to test
 * @public
 */
export function isCustomDashboardEvent(obj: unknown): obj is ICustomDashboardEvent {
    return !isEmpty(obj) && (obj as IDashboardEvent).type?.startsWith("CUSTOM/EVT");
}

/**
 * Tests whether object is an instance of {@link IDashboardEvent} or {@link ICustomDashboardEvent}.
 *
 * @param obj - object to test
 * @public
 */
export function isDashboardEventOrCustomDashboardEvent(
    obj: unknown,
): obj is IDashboardEvent | ICustomDashboardEvent {
    return isDashboardEvent(obj) || isCustomDashboardEvent(obj);
}

/**
 * @public
 */
export type DashboardEventBody<T extends IDashboardEvent | ICustomDashboardEvent> = Omit<T, "ctx">;
