// (C) 2026 GoodData Corporation

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link IChangeDashboardTimezoneOverride} command.
 *
 * @alpha
 */
export interface IChangeDashboardTimezoneOverridePayload {
    /**
     * Concrete IANA timezone id (e.g. "Europe/Prague"), the BROWSER_DETECTED sentinel (resolved
     * to the viewer's browser timezone by the handler), or undefined to clear the override so
     * the dashboard/workspace configuration applies again.
     */
    readonly timezoneId: string | undefined;
}

/**
 * @alpha
 */
export interface IChangeDashboardTimezoneOverride extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.CHANGE_TIMEZONE_OVERRIDE";
    readonly payload: IChangeDashboardTimezoneOverridePayload;
}

/**
 * Creates the ChangeDashboardTimezoneOverride command.
 *
 * @remarks
 * Dispatching this command will set (or clear, when timezoneId is undefined) the session-only
 * ad-hoc timezone override of the dashboard. The override takes precedence over the dashboard's
 * configured timezone, is never persisted with the dashboard, and resets on full reload.
 *
 * The command is rejected when the ad-hoc override is not allowed: the dashboard timezone
 * feature is disabled or the dashboard's timezone configuration does not allow user overrides
 * in view mode.
 *
 * @param timezoneId - concrete IANA timezone id, the BROWSER_DETECTED sentinel (resolved to the
 *  viewer's browser timezone by the handler), or undefined to clear the override
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeDashboardTimezoneOverride(
    timezoneId: string | undefined,
    correlationId?: string,
): IChangeDashboardTimezoneOverride {
    return {
        type: "GDC.DASH/CMD.CHANGE_TIMEZONE_OVERRIDE",
        correlationId,
        payload: {
            timezoneId,
        },
    };
}
