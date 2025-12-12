// (C) 2020-2025 GoodData Corporation

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link CreateAlert} command.
 * @beta
 */
export interface CreateAlertPayload {
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
export interface CreateAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERT.CREATE";
    readonly payload: CreateAlertPayload;
}

/**
 * Creates the SaveAlert command. Dispatching this command will result in the creating alert on the backend.
 *
 * @param alert - specify alert to create.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function createAlert(alert: IAutomationMetadataObjectDefinition, correlationId?: string): CreateAlert {
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
 * Payload of the {@link SaveAlert} command.
 * @beta
 */
export interface SaveAlertPayload {
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
export interface SaveAlert extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ALERT.SAVE";
    readonly payload: SaveAlertPayload;
}

/**
 * Creates the SaveAlert command. Dispatching this command will result in the saving alert on the backend.
 *
 * @param alert - specify alert to save.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function saveAlert(alert: IAutomationMetadataObject, correlationId?: string): SaveAlert {
    return {
        type: "GDC.DASH/CMD.ALERT.SAVE",
        correlationId,
        payload: {
            alert,
        },
    };
}
