// (C) 2021-2024 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IMetadataObject, IMetadataObjectDefinition } from "../ldm/metadata/types.js";
import { IAuditable } from "../base/metadata.js";
import {
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
} from "../exportDefinitions/index.js";

/**
 * @alpha
 */
export interface IAutomationMetadataObjectBase {
    /**
     * Schedule of the automation.
     * Object with cron expression, timezone and first run timestamp.
     */
    schedule?: IAutomationSchedule;

    /**
     * Target webhook that automation will trigger.
     * String with webhook (notificationChannel) id.
     */
    webhook?: string;

    /**
     * Export definitions of the automation (attachments).
     */
    exportDefinitions?: IExportDefinitionMetadataObject[];

    /**
     * Recipients of the automation.
     * Array of strings with user ids.
     */
    recipients?: IAutomationRecipient[];

    /**
     * Details of the automation.
     */
    details?: {
        /**
         * Subject of the email.
         */
        subject?: string;

        /**
         * Message of the email.
         */
        message?: string;
    };
}

/**
 * @alpha
 */
export interface IAutomationMetadataObject
    extends IAutomationMetadataObjectBase,
        IMetadataObject,
        IAuditable {
    type: "automation";
}

/**
 * @alpha
 */
export function isAutomationMetadataObject(obj: unknown): obj is IAutomationMetadataObject {
    return isAutomationMetadataObjectDefinition(obj) && !isEmpty((obj as IAutomationMetadataObject).id);
}

/**
 * @alpha
 */
export interface IAutomationMetadataObjectDefinition
    extends Omit<IAutomationMetadataObjectBase, "exportDefinitions">,
        IMetadataObjectDefinition,
        IAuditable {
    type: "automation";
    exportDefinitions?: (IExportDefinitionMetadataObjectDefinition | IExportDefinitionMetadataObject)[];
}

/**
 * @alpha
 */
export function isAutomationMetadataObjectDefinition(
    obj: unknown,
): obj is IAutomationMetadataObjectDefinition {
    return !isEmpty(obj) && (obj as IAutomationMetadataObject).type === "automation";
}

/**
 * @alpha
 */
export interface IAutomationSchedule {
    /**
     * Cron expression defining the schedule of the automation.
     * The format is SECOND MINUTE HOUR DAY-OF-MONTH MONTH DAY-OF-WEEK (YEAR).
     *
     * Example: 0 *\/30 9-17 ? * MON-FRI (every 30 minutes from 9:00 to 17:00 on workdays)
     */
    cron: string;

    /**
     * Timezone in which the schedule is defined.
     *
     * Example: Europe/Prague
     */
    timezone?: string;

    /**
     * Timestamp of the first scheduled action
     * If not provided default to the next scheduled time.
     * It should not include timezone information (use timezone property instead).
     *
     * Example: 2024-02-29T10:00:00.000Z
     */
    firstRun?: string;
}

/**
 * @alpha
 */
export type IAutomationRecipientType = "user" | "userGroup";

/**
 * @alpha
 */
export interface IAutomationRecipientBase {
    /**
     * Type of the recipient.
     */
    type: IAutomationRecipientType;

    /**
     * Id of the recipient.
     */
    id: string;
}

/**
 * @alpha
 */
export interface IAutomationUserRecipient extends IAutomationRecipientBase {
    /**
     * Type of the recipient.
     */
    type: "user";

    /**
     * Name of the recipient.
     */
    name?: string;

    /**
     * Email of the recipient, if available.
     */
    email?: string;
}

/**
 * Type guard checking if the object is of type {@link IAutomationUserRecipient}.
 * @alpha
 */
export function isAutomationUserRecipient(obj: unknown): obj is IAutomationUserRecipient {
    return !isEmpty(obj) && (obj as IAutomationUserRecipient).type === "user";
}

/**
 * @alpha
 */
export interface IAutomationUserGroupRecipient extends IAutomationRecipientBase {
    /**
     * Type of the recipient.
     */
    type: "userGroup";

    /**
     * Name of the group.
     */
    name?: string;
}

/**
 * Type guard checking if the object is of type {@link IAutomationUserGroupRecipient}.
 * @alpha
 */
export function isAutomationUserGroupRecipient(obj: unknown): obj is IAutomationUserGroupRecipient {
    return !isEmpty(obj) && (obj as IAutomationUserGroupRecipient).type === "userGroup";
}

/**
 * @alpha
 */
export type IAutomationRecipient = IAutomationUserRecipient | IAutomationUserGroupRecipient;
