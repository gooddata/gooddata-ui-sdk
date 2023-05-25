// (C) 2021-2023 GoodData Corporation

import { IFilterContextDefinition, IScheduledMailDefinition, ObjRef } from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link CreateScheduledEmail} command.
 * @beta
 */
export interface CreateScheduledEmailPayload {
    /**
     * The scheduled email to create.
     */
    readonly scheduledEmail: IScheduledMailDefinition;
    /**
     * Filter context to use for the scheduled email. If no filter context is provided, stored dashboard filter context will be used.
     */
    readonly filterContext?: IFilterContextDefinition;
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
 * @param filterContext - specify filter context to use for the scheduled email. If no filter context is provided, stored dashboard filter context will be used.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function createScheduledEmail(
    scheduledEmail: IScheduledMailDefinition,
    filterContext?: IFilterContextDefinition,
    correlationId?: string,
): CreateScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.CREATE",
        correlationId,
        payload: {
            scheduledEmail,
            filterContext,
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
    readonly scheduledEmail: IScheduledMailDefinition;
    /**
     * optionally specify existing filter context reference to be used for all attachments
     */
    readonly filterContextRef?: ObjRef;
}

/**
 * Saves existing SaveScheduledEmail command. Dispatching this command will result in saving scheduled email on the backend.
 *
 * @param scheduledEmail - specify scheduled email to save.
 * @param filterContextRef - optionally specify existing filter context reference to be used for all attachments
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing

 * @beta
 */
export function saveScheduledEmail(
    scheduledEmail: IScheduledMailDefinition,
    filterContextRef?: ObjRef,
    correlationId?: string,
): SaveScheduledEmail {
    return {
        type: "GDC.DASH/CMD.SCHEDULED_EMAIL.SAVE",
        correlationId,
        payload: {
            scheduledEmail,
            filterContextRef,
        },
    };
}
