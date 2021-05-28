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
    | "GDC.DASHBOARD.EVT.DF.VALIDATION.FAILED";

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
