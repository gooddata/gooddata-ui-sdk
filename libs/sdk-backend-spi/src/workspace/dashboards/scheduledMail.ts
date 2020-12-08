// (C) 2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardObjectIdentity } from "./common";

/**
 * A scheduled email common properties
 * @alpha
 */
export interface IScheduledMailBase {
    /**
     * Scheduled email title
     */
    title: string;

    /**
     * Scheduled email description
     */
    description: string;

    /**
     * Scheduled email job interval
     */
    when: {
        /**
         * Start date in YYYY-MM-DD format.
         */
        startDate: string;

        /**
         * End date in YYYY-MM-DD format.
         */
        endDate?: string;

        /**
         * Recurrence specification string
         * e.g. 0:0:1*3:12:30:0
         */
        recurrence: string;

        /**
         * Timezone
         * e.g. Europe/Amsterdam
         */
        timeZone: string;
    };

    /**
     * Recipients unique login identifiers - should be equal to login property in {@link IWorkspaceUser} / {@link IUser}
     */
    to: string[];

    /**
     * BCC recipients email addresses
     */
    bcc?: string[];

    /**
     * Unsubscribed recipients email addresses
     */
    unsubscribed?: string[];

    /**
     * Email subject
     */
    subject: string;

    /**
     * Email message body
     */
    body: string;

    /**
     * Email attachments
     */
    attachments: ScheduledMailAttachment[];

    /**
     * Date of the last successful email processing job run
     */
    lastSuccessful?: string;

    /**
     * Is unlisted?
     */
    unlisted: boolean;
}

/**
 * A scheduled email is used to notify a user with an exported dashboard according to a specified time interval
 * @alpha
 */
export interface IScheduledMailDefinition extends IScheduledMailBase, Partial<IDashboardObjectIdentity> {}

/**
 * Supported email attachments
 * @alpha
 */
export type ScheduledMailAttachment = IDashboardAttachment;

/**
 * Email attachment - dashboard exported as pdf
 * Optionally, you can setup specific filter context to use for the dashboard export
 * @alpha
 */
export interface IDashboardAttachment {
    /**
     * Dashboard object ref
     */
    dashboard: ObjRef;

    /**
     * File format
     */
    format: "pdf";

    /**
     * Export filter context
     */
    filterContext?: ObjRef;
}

/**
 * A scheduled email is used to notify a user with an exported dashboard according to a specified time interval
 * @alpha
 */
export interface IScheduledMail extends IScheduledMailBase, IDashboardObjectIdentity {}
