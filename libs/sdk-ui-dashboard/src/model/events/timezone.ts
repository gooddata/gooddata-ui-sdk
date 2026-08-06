// (C) 2026 GoodData Corporation

import { type DashboardContext } from "../types/commonTypes.js";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link IDashboardTimezoneOverrideChanged} event.
 *
 * @alpha
 */
export interface IDashboardTimezoneOverrideChangedPayload {
    /**
     * The new session-only timezone override: a concrete IANA timezone ID, or undefined when
     * the override was cleared. The payload never carries the browser-detected sentinel — the
     * command handler resolves it before the state is written and this event is emitted.
     */
    readonly timezoneOverride: string | undefined;

    /**
     * The effective dashboard timezone after the change: the override when set, otherwise the
     * dashboard's configured timezone (with the browser-detected sentinel resolved), or
     * undefined when no dashboard timezone applies (feature disabled or nothing configured).
     */
    readonly effectiveTimezone: string | undefined;
}

/**
 * This event is emitted after the session-only ad-hoc timezone override of the dashboard changes.
 *
 * @alpha
 */
export interface IDashboardTimezoneOverrideChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED";
    readonly payload: IDashboardTimezoneOverrideChangedPayload;
}

/**
 * Creates a dashboard timezone override changed event.
 *
 * @param ctx - dashboard context
 * @param timezoneOverride - resolved session-only timezone override
 * @param effectiveTimezone - effective dashboard timezone after the change
 * @param correlationId - command correlation ID
 * @returns dashboard timezone override changed event
 *
 * @alpha
 */
export function dashboardTimezoneOverrideChanged(
    ctx: DashboardContext,
    timezoneOverride: string | undefined,
    effectiveTimezone: string | undefined,
    correlationId?: string,
): IDashboardTimezoneOverrideChanged {
    return {
        type: "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
        ctx,
        correlationId,
        payload: {
            timezoneOverride,
            effectiveTimezone,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardTimezoneOverrideChanged}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardTimezoneOverrideChanged = eventGuard<IDashboardTimezoneOverrideChanged>(
    "GDC.DASH/EVT.TIMEZONE_OVERRIDE.CHANGED",
);
