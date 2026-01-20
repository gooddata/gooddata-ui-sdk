// (C) 2020-2026 GoodData Corporation

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link ICreateAlert} command.
 * @beta
 */
export interface ICreateAlertPayload {
    /**
     * The alert to be created.
     */
    readonly alert: IAutomationMetadataObjectDefinition;
}

/**
 * Creates alert.
 *
 * @beta
 */
export interface ICreateAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERT.CREATE";
    readonly payload: ICreateAlertPayload;
}

/**
 * Creates the SaveAlert command. Dispatching this command will result in the creating alert on the backend.
 *
 * @param alert - specify alert to create.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function createAlert(
    alert: IAutomationMetadataObjectDefinition,
    correlationId?: string,
): ICreateAlert {
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
 * Payload of the {@link ISaveAlert} command.
 * @beta
 */
export interface ISaveAlertPayload {
    /**
     * The alert to be saved.
     */
    readonly alert: IAutomationMetadataObject;
}

/**
 * Saves alert.
 *
 * @beta
 */
export interface ISaveAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERT.SAVE";
    readonly payload: ISaveAlertPayload;
}

/**
 * Creates the SaveAlert command. Dispatching this command will result in the saving alert on the backend.
 *
 * @param alert - specify alert to save.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function saveAlert(alert: IAutomationMetadataObject, correlationId?: string): ISaveAlert {
    return {
        type: "GDC.DASH/CMD.ALERT.SAVE",
        correlationId,
        payload: {
            alert,
        },
    };
}
