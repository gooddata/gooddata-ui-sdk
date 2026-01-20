// (C) 2021-2026 GoodData Corporation

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link ICreateScheduledEmail} command.
 * @beta
 */
export interface ICreateScheduledEmailPayload {
    /**
     * The scheduled email to create.
     */
    readonly scheduledEmail: IAutomationMetadataObjectDefinition;
}

/**
 * Creates scheduled email.
 *
 * @beta
 */
export interface ICreateScheduledEmail extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE";
    readonly payload: ICreateScheduledEmailPayload;
}

/**
 * Creates the CreateScheduledEmail command. 
 * 
 * Dispatching this command will result in the creating scheduled email on the backend.
 *
 * @param scheduledEmail - specify scheduled email to create.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function createScheduledEmail(
    scheduledEmail: IAutomationMetadataObjectDefinition,
    correlationId?: string,
): ICreateScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE",
        correlationId,
        payload: {
            scheduledEmail,
        },
    };
}

/**
 * Saves scheduled email.
 *
 * @beta
 */
export interface ISaveScheduledEmail extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE";
    readonly payload: ISaveScheduledEmailPayload;
}

/**
 * Payload of the {@link ISaveScheduledEmail} command.
 * @beta
 */
export interface ISaveScheduledEmailPayload {
    /**
     * The scheduled email to save.
     */
    readonly scheduledEmail: IAutomationMetadataObject;
}

/**
 * Saves existing SaveScheduledEmail command. Dispatching this command will result in saving scheduled email on the backend.
 *
 * @param scheduledEmail - specify scheduled email to save.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function saveScheduledEmail(
    scheduledEmail: IAutomationMetadataObject,
    correlationId?: string,
): ISaveScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE",
        correlationId,
        payload: {
            scheduledEmail,
        },
    };
}

/**
 * Initialize dashboard automations by loading essential data such as notification channels.
 * This initialization is necessary for working with alerts and scheduled exports.
 *
 * @beta
 */
export interface IInitializeAutomations extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.AUTOMATIONS.INITIALIZE";
}

/**
 * Creates the InitializeAutomations command.
 *
 * Dispatching this command will result in the initializing dashboard automations.
 * This initialization is necessary for working with alerts and scheduled exports.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function initializeAutomations(correlationId?: string): IInitializeAutomations {
    return {
        type: "GDC.DASH/CMD.AUTOMATIONS.INITIALIZE",
        correlationId,
    };
}

/**
 * Refresh the current dashboard's automation data.
 * This is particularly useful after creating, updating, or removing alerts or scheduled exports,
 * ensuring that the local data remains synchronized with the backend.
 *
 * @beta
 */
export interface IRefreshAutomations extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.AUTOMATIONS.REFRESH";
}

/**
 * Creates the RefreshAutomations command.
 *
 * Dispatching this command will result in refreshing the current dashboard's automation data.
 * This is particularly useful after creating, updating, or removing alerts or scheduled exports,
 * ensuring that the local data remains synchronized with the backend.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function refreshAutomations(correlationId?: string): IRefreshAutomations {
    return {
        type: "GDC.DASH/CMD.AUTOMATIONS.REFRESH",
        correlationId,
    };
}
