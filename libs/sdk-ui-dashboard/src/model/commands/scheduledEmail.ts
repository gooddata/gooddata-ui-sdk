// (C) 2021-2024 GoodData Corporation

import {
    IAutomationMetadataObjectDefinition,
    IAutomationMetadataObject,
    FilterContextItem,
} from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link CreateScheduledEmail} command.
 * @beta
 */
export interface CreateScheduledEmailPayload {
    /**
     * The scheduled email to create.
     */
    readonly scheduledEmail: IAutomationMetadataObjectDefinition;
    /**
     * Filter context filters to use for the scheduled email. If no filters are provided, stored dashboard filters will be used.
     */
    readonly filters?: FilterContextItem[];
}

/**
 * Creates scheduled email.
 *
 * @beta
 */
export interface CreateScheduledEmail extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE";
    readonly payload: CreateScheduledEmailPayload;
}

/**
 * Creates the CreateScheduledEmail command. 
 * 
 * Dispatching this command will result in the creating scheduled email on the backend.
 *
 * @param scheduledEmail - specify scheduled email to create.
 * @param filters - specify filter context filters to use for the scheduled email. If no filters are provided, stored dashboard filters will be used.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function createScheduledEmail(
    scheduledEmail: IAutomationMetadataObjectDefinition,
    filters?: FilterContextItem[],
    correlationId?: string,
): CreateScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE",
        correlationId,
        payload: {
            scheduledEmail,
            filters,
        },
    };
}

/**
 * Saves scheduled email.
 *
 * @beta
 */
export interface SaveScheduledEmail extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE";
    readonly payload: SaveScheduledEmailPayload;
}

/**
 * Payload of the {@link SaveScheduledEmail} command.
 * @beta
 */
export interface SaveScheduledEmailPayload {
    /**
     * The scheduled email to save.
     */
    readonly scheduledEmail: IAutomationMetadataObject;
    /**
     * optionally specify existing filter context filters to be used for all attachments
     */
    readonly filters?: FilterContextItem[];
}

/**
 * Saves existing SaveScheduledEmail command. Dispatching this command will result in saving scheduled email on the backend.
 *
 * @param scheduledEmail - specify scheduled email to save.
 * @param filters - optionally specify existing filter context filters to be used for all attachments
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function saveScheduledEmail(
    scheduledEmail: IAutomationMetadataObject,
    filters?: FilterContextItem[],
    correlationId?: string,
): SaveScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE",
        correlationId,
        payload: {
            scheduledEmail,
            filters,
        },
    };
}

/**
 * Creates scheduled email.
 *
 * @beta
 */
export interface RefreshAutomations extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.AUTOMATIONS.REFRESH";
    readonly payload: object;
}

/**
 * Creates the RefreshAutomations command.
 *
 * Dispatching this command will result in the refresh of automations from the backend.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function refreshAutomations(correlationId?: string): RefreshAutomations {
    return {
        type: "GDC.DASH/CMD.AUTOMATIONS.REFRESH",
        correlationId,
        payload: {},
    };
}
