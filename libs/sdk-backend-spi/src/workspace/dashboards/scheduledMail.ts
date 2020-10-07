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
         * Start date
         * e.g. YYYY-MM-DD
         */
        startDate: string;

        /**
         * End date
         * e.g. YYYY-MM-DD
         */
        endDate?: string;

        /**
         * Recurrency
         * e.g. 0:0:1*3:12:30:0
         */
        recurrency: string;

        /**
         * Timezone
         * e.g. Europe/Amsterdam
         */
        timeZone: string;
    };

    /**
     * Recipients email addresses
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
     * Last successfull job
     */
    lastSuccessfull?: string;

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
