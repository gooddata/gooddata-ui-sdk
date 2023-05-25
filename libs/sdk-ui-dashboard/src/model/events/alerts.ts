// (C) 2021-2023 GoodData Corporation
import { IWidgetAlert } from "@gooddata/sdk-model";

import { DashboardContext } from "../types/commonTypes.js";
import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";

/**
 * Payload of the {@link DashboardAlertCreated} event.
 * @beta
 */
export interface DashboardAlertCreatedPayload {
    /**
     * The alert created.
     */
    readonly alert: IWidgetAlert;
}

/**
 * This event is emitted after the Kpi alert is successfully saved.
 *
 * @beta
 */
export interface DashboardAlertCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.CREATED";
    readonly payload: DashboardAlertCreatedPayload;
}

export function alertCreated(
    ctx: DashboardContext,
    alert: IWidgetAlert,
    correlationId?: string,
): DashboardAlertCreated {
    return {
        type: "GDC.DASH/EVT.ALERT.CREATED",
        ctx,
        correlationId,
        payload: {
            alert,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAlertCreated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertCreated = eventGuard<DashboardAlertCreated>("GDC.DASH/EVT.ALERT.CREATED");

/**
 * Payload of the {@link DashboardAlertsRemoved} event.
 * @beta
 */
export interface DashboardAlertsRemovedPayload {
    /**
     * The alerts removed.
     */
    readonly alerts: IWidgetAlert[];
}

/**
 * This event is emitted after the Kpi alerts are successfully removed.
 *
 * @beta
 */
export interface DashboardAlertsRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERTS.REMOVED";
    readonly payload: DashboardAlertsRemovedPayload;
}

export function alertsRemoved(
    ctx: DashboardContext,
    alerts: IWidgetAlert[],
    correlationId?: string,
): DashboardAlertsRemoved {
    return {
        type: "GDC.DASH/EVT.ALERTS.REMOVED",
        ctx,
        correlationId,
        payload: {
            alerts,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAlertsRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertsRemoved = eventGuard<DashboardAlertsRemoved>("GDC.DASH/EVT.ALERTS.REMOVED");

/**
 * Payload of the {@link DashboardAlertUpdated} event.
 * @beta
 */
export interface DashboardAlertUpdatedPayload {
    /**
     * The alert updated.
     */
    readonly updated: IWidgetAlert;
}

/**
 * This event is emitted after the Kpi alert is updated.
 *
 * @beta
 */
export interface DashboardAlertUpdated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.UPDATED";
    readonly payload: DashboardAlertUpdatedPayload;
}

export function alertUpdated(
    ctx: DashboardContext,
    updated: IWidgetAlert,
    correlationId?: string,
): DashboardAlertUpdated {
    return {
        type: "GDC.DASH/EVT.ALERT.UPDATED",
        ctx,
        correlationId,
        payload: {
            updated,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAlertUpdated}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardAlertUpdated = eventGuard<DashboardAlertUpdated>("GDC.DASH/EVT.ALERT.UPDATED");
