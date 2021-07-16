// (C) 2021 GoodData Corporation
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../types/commonTypes";
import { IDashboardEvent } from "./base";

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

//
//
//

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

//
//
//

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
