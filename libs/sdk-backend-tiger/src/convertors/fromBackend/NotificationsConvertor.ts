// (C) 2024-2025 GoodData Corporation

import {
    INotification,
    IAlertNotificationDetails,
    IScheduleNotificationDetails,
    IAlertDescription,
    IAlertEvaluationRow,
    AlertDescriptionStatus,
    IAlertNotification,
    IScheduleNotification,
    IWebhookMessageDataAlert,
    IWebhookMessageDataSchedule,
} from "@gooddata/sdk-model";
import {
    AutomationNotification as Notification,
    AutomationWebhookMessageData as WebhookMessageData,
    AutomationTestNotification as TestNotification,
    AutomationAlertDescription as AlertDescription,
    AutomationAlertEvaluationRow as AlertEvaluationRow,
    AutomationAutomationNotification,
} from "@gooddata/api-client-tiger";

/**
 * Converts alert evaluation row from backend format to frontend format
 * @param row - alert evaluation row in backend format
 * @returns alert evaluation row in frontend format
 * @internal
 */
function convertAlertEvaluationRow(row: AlertEvaluationRow): IAlertEvaluationRow {
    return {
        primaryMetric: row.primaryMetric && {
            value: row.primaryMetric.value,
            formattedValue: row.primaryMetric.formattedValue,
        },
        secondaryMetric: row.secondaryMetric && {
            value: row.secondaryMetric.value,
            formattedValue: row.secondaryMetric.formattedValue,
        },
        computedMetric: row.computedMetric && {
            value: row.computedMetric.value,
            formattedValue: row.computedMetric.formattedValue,
        },
        labelValue: row.labelValue,
    };
}

/**
 * Converts alert description from backend format to frontend format
 * @param alert - alert description in backend format
 * @returns alert description in frontend format
 * @internal
 */
function convertAlertDescription(alert: AlertDescription): IAlertDescription {
    return {
        metric: alert.metric,
        condition: alert.condition,
        currentValues: alert.currentValues?.map(convertAlertEvaluationRow),
        attribute: alert.attribute,
        totalValueCount: alert.totalValueCount,
        triggeredCount: alert.triggeredCount,
        threshold: alert.threshold,
        formattedThreshold: alert.formattedThreshold,
        lowerThreshold: alert.lowerThreshold,
        upperThreshold: alert.upperThreshold,
        status: alert.status as AlertDescriptionStatus,
        errorMessage: alert.errorMessage,
        traceId: alert.traceId,
    };
}

/**
 * Converts webhook message data from backend format to frontend format
 * @param data - webhook message data in backend format
 * @returns webhook message data in frontend format
 * @internal
 */
function convertWebhookMessageData(
    data: WebhookMessageData,
): IWebhookMessageDataAlert | IWebhookMessageDataSchedule {
    return {
        automation: {
            id: data.automation.id,
            title: data.automation.title,
            dashboardURL: data.automation.dashboardURL,
            dashboardTitle: data.automation.dashboardTitle,
            isCustomDashboardURL: data.automation.isCustomDashboardURL,
        },
        recipients: data.recipients,
        details: data.details,
        remainingActionCount: data.remainingActionCount,
        tabularExports: data.tabularExports,
        dashboardTabularExports: data.dashboardTabularExports,
        visualExports: data.visualExports,
        imageExports: data.imageExports,
        rawExports: data.rawExports,
        slidesExports: data.slidesExports,
        alert: data.alert ? convertAlertDescription(data.alert) : undefined,
        filters: data.filters,
    };
}

/**
 * Converts notification details from backend format to frontend format
 * @param data - notification data in backend format
 * @returns notification details in frontend format
 * @internal
 */
function convertNotificationDetails(
    data: AutomationAutomationNotification,
): IAlertNotificationDetails | IScheduleNotificationDetails {
    return {
        timestamp: data.content.timestamp,
        webhookMessageType: data.content.type,
        data: convertWebhookMessageData(data.content.data),
    };
}

/**
 * Converts notification from backend format to frontend format
 * @param notification - notification in backend format
 * @returns notification in frontend format
 * @internal
 */
export function convertNotificationFromBackend(notification: Notification): INotification {
    if (notification.data.type === "AUTOMATION") {
        const notificationData = notification.data as AutomationAutomationNotification;
        const notificationType = notificationData.content.data.alert
            ? "alertNotification"
            : "scheduleNotification";

        return {
            type: "notification",
            notificationType,
            id: notification.id,
            workspaceId: notification.workspaceId,
            automationId: notification.automationId,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            details: convertNotificationDetails(notificationData),
        } as IAlertNotification | IScheduleNotification;
    }

    return {
        type: "notification",
        notificationType: "testNotification",
        id: notification.id,
        workspaceId: notification.workspaceId,
        details: {
            message: (notification.data as TestNotification).message,
        },
        isRead: notification.isRead,
        createdAt: notification.createdAt,
    };
}
