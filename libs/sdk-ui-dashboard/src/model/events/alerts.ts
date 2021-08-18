// (C) 2021 GoodData Corporation
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";

import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";
import { eventGuard } from "./util";

/**
 * This event is emitted after the Kpi alert is successfully saved.
 *
 * @alpha
 */
export interface DashboardAlertCreated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.CREATED";
    readonly payload: {
        readonly alert: IWidgetAlert;
    };
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
 * @alpha
 */
export const isDashboardAlertCreated = eventGuard<DashboardAlertCreated>("GDC.DASH/EVT.ALERT.CREATED");

/**
 * This event is emitted after the Kpi alert is successfully removed.
 *
 * @alpha
 */
export interface DashboardAlertRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.REMOVED";
    readonly payload: {
        readonly alert: IWidgetAlert;
    };
}

export function alertRemoved(
    ctx: DashboardContext,
    alert: IWidgetAlert,
    correlationId?: string,
): DashboardAlertRemoved {
    return {
        type: "GDC.DASH/EVT.ALERT.REMOVED",
        ctx,
        correlationId,
        payload: {
            alert,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link DashboardAlertRemoved}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isDashboardAlertRemoved = eventGuard<DashboardAlertRemoved>("GDC.DASH/EVT.ALERT.REMOVED");

/**
 * This event is emitted after the Kpi alert is updated.
 *
 * @alpha
 */
export interface DashboardAlertUpdated extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.ALERT.UPDATED";
    readonly payload: {
        readonly updated: IWidgetAlert;
    };
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
 * @alpha
 */
export const isDashboardAlertUpdated = eventGuard<DashboardAlertUpdated>("GDC.DASH/EVT.ALERT.UPDATED");
