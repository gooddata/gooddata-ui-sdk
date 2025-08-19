// (C) 2021-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

import { IAuditable } from "../base/metadata.js";
import { IExecutionDefinition } from "../execution/executionDefinition/index.js";
import { IMeasure } from "../execution/measure/index.js";
import {
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
} from "../exports/index.js";
import { IMetadataObject, IMetadataObjectDefinition } from "../ldm/metadata/types.js";
import { Identifier } from "../objRef/index.js";

/**
 * @public
 */
export interface IAutomationDetails {
    /**
     * Name of the widget.
     */
    widgetName?: string;

    /**
     * Subject of the email.
     */
    subject?: string;

    /**
     * Message of the email.
     */
    message?: string;
}

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
     * Last run of the automation.
     */
    lastRun?: {
        /**
         * Status of the last run.
         */
        status?: IAutomationStatus;

        /**
         * Timestamp of the last run.
         */
        executedAt?: string;

        /**
         * Trace id of the last run.
         */
        traceId?: string;

        /**
         * Result of the last run.
         */
        errorMessage?: string;
    };

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
     */
    recipients?: IAutomationRecipient[];

    /**
     * Details of the automation.
     */
    details?: IAutomationDetails;

    /**
     * Dashboard that automation is related to.
     */
    dashboard?: {
        /**
         * Dashboard id.
         */
        id?: Identifier;
        /**
         * Dashboard title.
         */
        title?: string;
    };

    /**
     * Additional metadata of the automation.
     */
    metadata?: {
        /**
         * Local identifier of the widget, if the automation is alerting
         * (scheduled exports widget local identifier is stored in exportDefinition)
         */
        widget?: string;

        /**
         * Filters that are used in the alerting configuration when creating a condition with some measure.
         */
        filters?: string[];

        /**
         * Filters description used for display in all client-related places (e.g. UI, e-mail, exports, etc.)
         */
        visibleFilters?: IAutomationVisibleFilter[];
    };
}

/**
 * @alpha
 */
export interface IAutomationVisibleFilter {
    localIdentifier?: string;
    title?: string;
    isAllTimeDateFilter?: boolean;
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
export type IAutomationRecipientType = "user" | "userGroup" | "externalUser";

/**
 * @alpha
 */
export type IAutomationStatus = "SUCCESS" | "FAILED";

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
export interface IAutomationExternalRecipient extends Omit<IAutomationUserRecipient, "type"> {
    /**
     * Type of the recipient.
     */
    type: "externalUser";
}

/**
 * Type guard checking if the object is of type {@link IAutomationExternalRecipient}.
 * @alpha
 */
export function isAutomationExternalUserRecipient(obj: unknown): obj is IAutomationExternalRecipient {
    return !isEmpty(obj) && (obj as IAutomationExternalRecipient).type === "externalUser";
}

/**
 * @alpha
 */
export interface IAutomationUnknownRecipient extends Omit<IAutomationUserRecipient, "type"> {
    /**
     * Type of the recipient.
     */
    type: "unknownUser";
}

/**
 * Type guard checking if the object is of type {@link IAutomationExternalRecipient}.
 * @alpha
 */
export function isAutomationUnknownUserRecipient(obj: unknown): obj is IAutomationUnknownRecipient {
    return !isEmpty(obj) && (obj as IAutomationUnknownRecipient).type === "unknownUser";
}

/**
 * @alpha
 */
export type IAutomationRecipient =
    | IAutomationUserRecipient
    | IAutomationUserGroupRecipient
    | IAutomationExternalRecipient
    | IAutomationUnknownRecipient;

/**
 * @alpha
 */
export type IAutomationAlertExecutionDefinition = Pick<
    IExecutionDefinition,
    "attributes" | "measures" | "filters"
> & {
    /**
     * Metrics to be referenced from other AFM objects (e.g. filters) but not included in the result.
     */
    readonly auxMeasures?: IMeasure[];
};

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
export type IAutomationAlertCondition =
    | IAutomationAlertComparisonCondition
    | IAutomationAlertRelativeCondition;

/**
 * @alpha
 */
export interface IAutomationAlertComparisonCondition {
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
    left: {
        /**
         * Identifier of the measure.
         */
        id: string;
        /**
         * Title of the measure.
         */
        title?: string;
        /**
         * Format of the measure.
         */
        format?: string;
    };

    /**
     * Right side of the condition.
     */
    right: number;
}

/**
 * @alpha
 */
export type IAlertRelativeOperator = "INCREASES_BY" | "DECREASES_BY" | "CHANGES_BY";

/**
 * @alpha
 */
export type IAlertRelativeArithmeticOperator = "DIFFERENCE" | "CHANGE";

/**
 * @alpha
 */
export interface IAutomationAlertRelativeCondition {
    /**
     * Type of the condition.
     */
    type: "relative";

    /**
     * Operator of the condition.
     */
    operator: IAlertRelativeOperator;

    /**
     * Identifier of the measures calculated in the condition.
     */
    measure: {
        /**
         * Operator of the measure.
         */
        operator: IAlertRelativeArithmeticOperator;

        /**
         * Identifier of left side of the condition.
         */
        left: {
            /**
             * Identifier of the measure.
             */
            id: string;
            /**
             * Title of the measure.
             */
            title?: string;
            /**
             * Format of the measure.
             */
            format?: string;
        };

        /**
         * Identifier of right side of the condition.
         */
        right: {
            /**
             * Identifier of the measure.
             */
            id: string;
            /**
             * Title of the measure.
             */
            title?: string;
            /**
             * Format of the measure.
             */
            format?: string;
        };
    };

    /**
     * Threshold of the condition.
     */
    threshold: number;
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
