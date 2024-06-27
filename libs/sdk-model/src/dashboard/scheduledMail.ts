// (C) 2020-2024 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IAuditableUsers } from "../base/metadata.js";
import { ObjRef } from "../objRef/index.js";
import { IDashboardObjectIdentity } from "./common.js";

/**
 * A scheduled email common properties
 * @alpha
 * @deprecated - use {@link IAutomationMetadataObjectBase} instead
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
 * @deprecated - use {@link IAutomationMetadataObjectDefinition} instead
 */
export interface IScheduledMailDefinition extends IScheduledMailBase, Partial<IDashboardObjectIdentity> {}

/**
 * Supported email attachments
 * @alpha
 * @deprecated - use {@link IExportDefinitionMetadataObject} instead
 */
export type ScheduledMailAttachment = IDashboardAttachment | IWidgetAttachment;

/**
 * Email attachment - dashboard exported as pdf.
 *
 * @remarks
 * You can setup specific filter context to use for the dashboard export
 * @alpha
 * @deprecated - use {@link IExportDefinitionMetadataObject} instead
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
 * Type-guard testing whether the provided object is an instance of {@link IDashboardAttachment}.
 *
 * @alpha
 */

export function isDashboardAttachment(obj: unknown): obj is IDashboardAttachment {
    return !isEmpty(obj) && (obj as IDashboardAttachment).dashboard !== undefined;
}

/**
 * Email attachment - widget exported as csv or/and xlsx.
 *
 * @remarks
 * You can setup specific filter context to use for the widget export
 * @alpha
 * @deprecated - use {@link IExportDefinitionMetadataObject} instead
 */
export interface IWidgetAttachment {
    /**
     * The dashboard on which is the widget to be exported
     */
    widgetDashboard: ObjRef;

    /**
     * Widget object ref
     */
    widget: ObjRef;

    /**
     * File format
     */
    formats: ("csv" | "xlsx")[];

    /**
     * Export filter context
     */
    filterContext?: ObjRef;

    /**
     *
     */
    exportOptions?: IExportOptions;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetAttachment}.
 *
 * @alpha
 */

export function isWidgetAttachment(obj: unknown): obj is IWidgetAttachment {
    return !isEmpty(obj) && (obj as IWidgetAttachment).widget !== undefined;
}

/**
 * Configuration of the exported file
 * @alpha
 */
export interface IExportOptions {
    includeFilters?: boolean;
    mergeHeaders?: boolean;
}

/**
 * A scheduled email is used to notify a user with an exported dashboard according to a specified time interval
 * @alpha
 * @deprecated - use {@link IAutomationMetadataObject} instead
 */
export interface IScheduledMail extends IAuditableUsers, IScheduledMailBase, IDashboardObjectIdentity {}
