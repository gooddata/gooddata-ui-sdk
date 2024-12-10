// (C) 2024 GoodData Corporation
import { IExportResult } from "../exports/index.js";
import { IAutomationDetails } from "../automations/index.js";

/**
 * Type of the notification.
 *
 * @alpha
 */
export type NotificationType = "alertNotification" | "scheduleNotification" | "testNotification";

/**
 * Notification with details about the automation or test that triggered it.
 *
 * @alpha
 */
export interface INotificationBase {
    /**
     * Type of the object for type narrowing.
     */
    type: "notification";

    /**
     * Type of the notification.
     */
    notificationType: NotificationType;

    /**
     * Unique identifier of the notification.
     */
    id: string;

    /**
     * Identifier of the workspace if the notification was created in a workspace context.
     */
    workspaceId?: string;

    /**
     * Indicates whether the notification has been read.
     */
    isRead: boolean;

    /**
     * Timestamp when the notification was created.
     */
    createdAt: string;
}

/**
 * Notification with details about the alert that triggered it.
 *
 * @alpha
 */
export interface IAlertNotification extends INotificationBase {
    notificationType: "alertNotification";

    /**
     * Identifier of the automation (alert / schedule) if the notification was created in an automation context.
     */
    automationId?: string;

    /**
     * Details of the automation that triggered the notification.
     */
    details: IAlertNotificationDetails;
}

/**
/**
 * Notification with details about the schedule that triggered it.
 *
 * @alpha
 */
export interface IScheduleNotification extends INotificationBase {
    notificationType: "scheduleNotification";

    /**
     * Identifier of the automation (alert / schedule) if the notification was created in an automation context.
     */
    automationId?: string;

    /**
     * Details of the automation that triggered the notification.
     */
    details: IScheduleNotificationDetails;
}

/**
 * Notification with details about the test that triggered it.
 *
 * @alpha
 */
export interface ITestNotification extends INotificationBase {
    notificationType: "testNotification";

    /**
     * Details of the test that triggered the notification.
     */
    details: ITestNotificationDetails;
}

/**
 * Notification with details about the automation or test that triggered it.
 *
 * @alpha
 */
export interface ITestNotificationDetails {
    /**
     * Message of the test notification.
     */
    message: string;
}

/**
 * Notification with details about the automation or test that triggered it.
 *
 * @alpha
 */
export interface IAutomationNotificationDetailsBase {
    /**
     * Timestamp when the notification was created.
     */
    timestamp: string;

    /**
     * Type of the notification.
     */
    webhookMessageType: AutomationNotificationType;
}

/**
 * Details of the alert notification.
 *
 * @alpha
 */
export interface IAlertNotificationDetails extends IAutomationNotificationDetailsBase {
    /**
     * Data from the webhook message.
     */
    data: IWebhookMessageDataAlert;
}

/**
 * Details of the schedule notification.
 *
 * @alpha
 */
export interface IScheduleNotificationDetails extends IAutomationNotificationDetailsBase {
    /**
     * Data from the webhook message.
     */
    data: IWebhookMessageDataSchedule;
}

/**
 * Automation notification type.
 *
 * @alpha
 */
export type AutomationNotificationType = "automation-task.completed" | "automation-task.limit-exceeded";

/**
 * Data from the webhook message.
 *
 * @alpha
 */
export interface IWebhookMessageDataBase {
    /**
     * Automation information.
     */
    automation: IWebhookAutomationInfo;

    /**
     * Recipients of the webhook message.
     */
    recipients?: WebhookRecipient[];

    /**
     * Automation details.
     */
    details?: IAutomationDetails;

    /**
     * Remaining export/alert evaluation count
     */
    remainingActionCount?: number;

    /**
     * Tabular export results
     */
    tabularExports?: IExportResult[];

    /**
     * Visual export results
     */
    visualExports?: IExportResult[];
}

/**
 * Data from the webhook message.
 *
 * @alpha
 */
export interface IWebhookMessageDataAlert extends IWebhookMessageDataBase {
    /**
     * Alert description.
     */
    alert: IAlertDescription;
}

/**
 * Data from the webhook message.
 *
 * @alpha
 */
export type IWebhookMessageDataSchedule = IWebhookMessageDataBase;

/**
 * Automation information.
 *
 * @alpha
 */
export interface IWebhookAutomationInfo {
    /**
     * Identifier of the automation.
     */
    id: string;

    /**
     * Title of the automation.
     */
    title?: string;

    /**
     * URL of the dashboard, or custom dashboard URL (if configured on automation).
     */
    dashboardURL: string;
}

/**
 * Alert description.
 *
 * @alpha
 */
export interface IAlertDescription {
    /**
     * Title of the metric.
     */
    metric: string;

    /**
     * Condition of the alert (in human readable form).
     */
    condition: string;

    /**
     * Current values that triggered the alert (if sliced by attribute).
     */
    currentValues?: IAlertEvaluationRow[];

    /**
     * Attribute of the alert (if sliced by attribute).
     */
    attribute?: string;

    /**
     * Filter count of the alert.
     */
    filterCount?: number;

    /**
     * Total values count that can trigger the alert.
     */
    totalValueCount?: number;

    /**
     * Count of values that triggered the alert.
     */
    triggeredCount?: number;

    /**
     * Threshold set to trigger the alert.
     */
    threshold?: number;

    /**
     * Threshold set to trigger the alert - formatted.
     */
    formattedThreshold?: string;

    /**
     * Lower threshold of the alert.
     */
    lowerThreshold?: number;

    /**
     * Upper threshold of the alert.
     */
    upperThreshold?: number;

    /**
     * Result of the execution that evaluated the alert.
     */
    status?: AlertDescriptionStatus;

    /**
     * Error message of the alert.
     */
    errorMessage?: string;

    /**
     * Trace ID of the alert.
     */
    traceId?: string;
}

/**
 * Alert evaluation row.
 *
 * @alpha
 */
export interface IAlertEvaluationRow {
    /**
     * Primary metric value.
     */
    primaryMetric?: IAlertEvaluationRowMetric;

    /**
     * Secondary metric value.
     */
    secondaryMetric?: IAlertEvaluationRowMetric;

    /**
     * Computed metric value.
     */
    computedMetric?: IAlertEvaluationRowMetric;

    /**
     * Label element value (if sliced by attribute).
     */
    labelValue?: string;
}

/**
 * Metric value.
 *
 * @alpha
 */
export interface IAlertEvaluationRowMetric {
    /**
     * Metric value.
     */
    value: number;

    /**
     * Metric value - formatted.
     */
    formattedValue?: string;
}

/**
 * Webhook recipient.
 *
 * @alpha
 */
export type WebhookRecipient = {
    /**
     * Identifier of the recipient.
     */
    id: string;

    /**
     * Email of the recipient.
     */
    email: string;
};

/**
 * Alert description status.
 *
 * @alpha
 */
export type AlertDescriptionStatus = "SUCCESS" | "ERROR" | "INTERNAL_ERROR" | "TIMEOUT";

/**
 * Notification.
 *
 * @alpha
 */
export type INotification = IAlertNotification | IScheduleNotification | ITestNotification;
