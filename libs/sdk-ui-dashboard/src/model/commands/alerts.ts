// (C) 2021-2022 GoodData Corporation

import { IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base";

/**
 * Payload of the {@link CreateAlert} command.
 * @alpha
 */
export interface CreateAlertPayload {
    /**
     * The alert to be created.
     */
    readonly alert: IWidgetAlertDefinition;
}

/**
 * Creates Kpi alert.
 *
 * @alpha
 */
export interface CreateAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERT.CREATE";
    readonly payload: CreateAlertPayload;
}

/**
 * Creates the SaveAlert command. Dispatching this command will result in the creating Kpi alert on the backend.
 *
 * @param alert - specify alert to create.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function createAlert(alert: IWidgetAlertDefinition, correlationId?: string): CreateAlert {
    return {
        type: "GDC.DASH/CMD.ALERT.CREATE",
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
 * Payload of the {@link UpdateAlert} command.
 * @alpha
 */
export interface UpdateAlertPayload {
    /**
     * The alert to be updated.
     */
    readonly alert: IWidgetAlert;
}

/**
 * Updates Kpi alert.
 *
 * @alpha
 */
export interface UpdateAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERT.UPDATE";
    readonly payload: UpdateAlertPayload;
}

/**
 * Creates the UpdateAlert command. Dispatching this command will result in the updating Kpi alert on the backend.
 *
 * @param alert - specify alert to update.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @alpha
 */
export function updateAlert(alert: IWidgetAlert, correlationId?: string): UpdateAlert {
    return {
        type: "GDC.DASH/CMD.ALERT.UPDATE",
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
 * Payload of the {@link RemoveAlerts} command.
 * @alpha
 */
export interface RemoveAlertsPayload {
    /**
     * References to Kpi alerts that should be removed.
     */
    readonly refs: ObjRef[];
}

/**
 * Removes Kpi alerts.
 *
 * @alpha
 */
export interface RemoveAlerts extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERTS.REMOVE";
    readonly payload: RemoveAlertsPayload;
}

/**
 * Creates the RemoveAlerts command. Dispatching this command will result in the removing Kpi alerts on the backend.
 *
 * @param refs - specify ObjRef of the alerts to remove
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @alpha
 */
export function removeAlerts(refs: ObjRef[], correlationId?: string): RemoveAlerts {
    return {
        type: "GDC.DASH/CMD.ALERTS.REMOVE",
        correlationId,
        payload: {
            refs,
        },
    };
}
