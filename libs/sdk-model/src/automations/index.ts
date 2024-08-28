// (C) 2021-2024 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IMetadataObject, IMetadataObjectDefinition } from "../ldm/metadata/types.js";
import { IAuditable } from "../base/metadata.js";
import {
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
} from "../exportDefinitions/index.js";
import { IExecutionDefinition } from "../execution/executionDefinition/index.js";
import { Identifier } from "../objRef/index.js";

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
     * Alerting configuration of the automation.
     */
    alert?: IAutomationAlert;

    /**
     * Target notificationChannel that automation will trigger.
     * String with webhook (notificationChannel) id.
     */
    notificationChannel?: string;

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

    /**
     * Dashboard that automation is related to.
     */
    dashboard?: Identifier;

    /**
     * Additional metadata of the automation.
     */
    metadata?: {
        widget?: string;
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
     * Human-readable description of the cron expression.
     */
    cronDescription?: string;

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

/**
 * @alpha
 */
export type IAutomationAlertExecutionDefinition = Pick<
    IExecutionDefinition,
    "attributes" | "measures" | "filters"
>;

/**
 * @alpha
 */
export type IAlertComparisonOperator =
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO";

/**
 * @alpha
 */
export interface IAutomationAlertCondition {
    /**
     * Type of the condition.
     */
    type: "comparison";

    /**
     * Operator of the condition.
     */
    operator: IAlertComparisonOperator;

    /**
     * Identifier of left side of the condition.
     */
    left: string;

    /**
     * Right side of the condition.
     */
    right: number;
}

/**
 * @alpha
 */
export interface IAutomationAlert {
    /**
     * Execution definition of the alert.
     */
    execution: IAutomationAlertExecutionDefinition;

    /**
     * Condition of the alert.
     */
    condition: IAutomationAlertCondition;

    /**
     * Trigger state of the alert.
     */
    trigger: IAutomationAlertTrigger;
}

/**
 * @alpha
 */
export interface IAutomationAlertTrigger {
    /**
     * Overrides the default trigger mode, set on organization settings level.
     */
    mode?: IAlertTriggerMode;

    /**
     * State of the trigger.
     */
    state: IAlertTriggerState;
}

/**
 * @alpha
 */
export type IAlertTriggerMode = "ALWAYS" | "ONCE";

/**
 * @alpha
 */
export type IAlertTriggerState = "ACTIVE" | "PAUSED";
