// (C) 2025 GoodData Corporation

import { defineMessages } from "react-intl";

import { AutomationsType } from "./types.js";

export const messages = defineMessages({
    comparisonOperatorLessThan: {
        id: "automations.alert.config.comparisonOperator.lessThan",
    },
    comparisonOperatorLessThanOrEquals: {
        id: "automations.alert.config.comparisonOperator.lessThanOrEquals",
    },
    comparisonOperatorGreaterThan: {
        id: "automations.alert.config.comparisonOperator.greaterThan",
    },
    comparisonOperatorGreaterThanOrEquals: {
        id: "automations.alert.config.comparisonOperator.greaterThanOrEquals",
    },
    comparisonOperatorChangeIncreasesBy: {
        id: "automations.alert.config.changeOperator.increasesBy",
    },
    comparisonOperatorChangeDecreasesBy: {
        id: "automations.alert.config.changeOperator.decreasesBy",
    },
    comparisonOperatorChangeChangesBy: {
        id: "automations.alert.config.changeOperator.changesBy",
    },
    comparisonOperatorDifferenceIncreasesBy: {
        id: "automations.alert.config.differenceOperator.increasesBy",
    },
    comparisonOperatorDifferenceDecreasesBy: {
        id: "automations.alert.config.differenceOperator.decreasesBy",
    },
    comparisonOperatorDifferenceChangesBy: {
        id: "automations.alert.config.differenceOperator.changesBy",
    },
    untitledUser: {
        id: "automations.filter.untitledUser",
    },
    filterAllDashboards: {
        id: "automations.filter.allDashboards",
    },
    filterAllRecipients: {
        id: "automations.filter.allRecipients",
    },
    filterAllAuthors: {
        id: "automations.filter.allAuthors",
    },
    filterAllStatus: {
        id: "automations.filter.allStatus",
    },
    filterDashboardLabel: {
        id: "automations.filter.dashboard.label",
    },
    filterRecipientsLabel: {
        id: "automations.filter.recipients.label",
    },
    filterCreatedByLabel: {
        id: "automations.filter.createdBy.label",
    },
    filterStatusLabel: {
        id: "automations.filter.status.label",
    },
    filterWorkspacesLabel: {
        id: "automations.filter.workspaces.label",
    },
    filterStatusSuccess: {
        id: "automations.filter.status.success",
    },
    filterStatusFailed: {
        id: "automations.filter.status.failed",
    },
    filterStatusNeverRun: {
        id: "automations.filter.status.neverRun",
    },
    cellLastRunNever: {
        id: "automations.cell.lastRun.never",
    },
    currentUser: {
        id: "automations.filter.currentUser",
    },
    columnId: {
        id: "automations.column.id",
    },
    columnName: {
        id: "automations.column.name",
    },
    columnDashboard: {
        id: "automations.column.dashboard",
    },
    columnWidget: {
        id: "automations.column.widget",
    },
    columnAttachments: {
        id: "automations.column.attachments",
    },
    columnNextRun: {
        id: "automations.column.nextRun",
    },
    columnRecipients: {
        id: "automations.column.recipients",
    },
    columnLastSent: {
        id: "automations.column.lastSent",
    },
    columnState: {
        id: "automations.column.state",
    },
    columnLastRunStatus: {
        id: "automations.column.lastRunStatus",
    },
    columnCreatedBy: {
        id: "automations.column.createdBy",
    },
    columnCreatedAt: {
        id: "automations.column.createdAt",
    },
    columnNotificationChannel: {
        id: "automations.column.notificationChannel",
    },
    columnWorkspace: {
        id: "automations.column.workspace",
    },
    menuEdit: {
        id: "automations.menu.edit",
    },
    menuDelete: {
        id: "automations.menu.delete",
    },
    menuUnsubscribe: {
        id: "automations.menu.unsubscribe",
    },
    menuPause: {
        id: "automations.menu.pause",
    },
    menuResume: {
        id: "automations.menu.resume",
    },
    menuLabel: {
        id: "automations.menu.ariaLabel",
    },
    iconTooltipStatus: {
        id: "automations.icon.tooltip.status",
    },
    iconTooltipTraceId: {
        id: "automations.icon.tooltip.traceId",
    },
    menuCopyId: {
        id: "automations.menu.copyId",
    },
    messageCopyIdSuccess: {
        id: "automations.message.copyId.success",
    },
    //Schedule actions info messages
    messageScheduleDeleteSuccess: {
        id: "automations.message.schedule.delete.success",
    },
    messageScheduleDeleteError: {
        id: "automations.message.schedule.delete.error",
    },
    messageScheduleUnsubscribeSuccess: {
        id: "automations.message.schedule.unsubscribe.success",
    },
    messageScheduleUnsubscribeError: {
        id: "automations.message.schedule.unsubscribe.error",
    },
    messageScheduleBulkDeleteSuccess: {
        id: "automations.message.schedule.bulk.delete.success",
    },
    messageScheduleBulkDeleteError: {
        id: "automations.message.schedule.bulk.delete.error",
    },
    messageScheduleBulkUnsubscribeSuccess: {
        id: "automations.message.schedule.bulk.unsubscribe.success",
    },
    messageScheduleBulkUnsubscribeError: {
        id: "automations.message.schedule.bulk.unsubscribe.error",
    },
    messageSchedulePauseSuccess: {
        id: "automations.message.schedule.pause.success",
    },
    messageSchedulePauseError: {
        id: "automations.message.schedule.pause.error",
    },
    messageScheduleBulkPauseSuccess: {
        id: "automations.message.schedule.bulk.pause.success",
    },
    messageScheduleBulkPauseError: {
        id: "automations.message.schedule.bulk.pause.error",
    },
    messageScheduleResumeSuccess: {
        id: "automations.message.schedule.resume.success",
    },
    messageScheduleResumeError: {
        id: "automations.message.schedule.resume.error",
    },
    messageScheduleBulkResumeSuccess: {
        id: "automations.message.schedule.bulk.resume.success",
    },
    messageScheduleBulkResumeError: {
        id: "automations.message.schedule.bulk.resume.error",
    },
    //Alert actions info messages
    messageAlertDeleteSuccess: {
        id: "automations.message.alert.delete.success",
    },
    messageAlertDeleteError: {
        id: "automations.message.alert.delete.error",
    },
    messageAlertUnsubscribeSuccess: {
        id: "automations.message.alert.unsubscribe.success",
    },
    messageAlertUnsubscribeError: {
        id: "automations.message.alert.unsubscribe.error",
    },
    messageAlertBulkDeleteSuccess: {
        id: "automations.message.alert.bulk.delete.success",
    },
    messageAlertBulkDeleteError: {
        id: "automations.message.alert.bulk.delete.error",
    },
    messageAlertBulkUnsubscribeSuccess: {
        id: "automations.message.alert.bulk.unsubscribe.success",
    },
    messageAlertBulkUnsubscribeError: {
        id: "automations.message.alert.bulk.unsubscribe.error",
    },
    messageAlertPauseSuccess: {
        id: "automations.message.alert.pause.success",
    },
    messageAlertPauseError: {
        id: "automations.message.alert.pause.error",
    },
    messageAlertBulkPauseSuccess: {
        id: "automations.message.alert.bulk.pause.success",
    },
    messageAlertBulkPauseError: {
        id: "automations.message.alert.bulk.pause.error",
    },
    messageAlertResumeSuccess: {
        id: "automations.message.alert.resume.success",
    },
    messageAlertResumeError: {
        id: "automations.message.alert.resume.error",
    },
    messageAlertBulkResumeSuccess: {
        id: "automations.message.alert.bulk.resume.success",
    },
    messageAlertBulkResumeError: {
        id: "automations.message.alert.bulk.resume.error",
    },
    //Automation icon tooltip messages
    messageAutomationIconTooltipTraceIdCopied: {
        id: "automations.message.automationIconTooltipTraceIdCopied",
    },
    automationIconTooltipHeaderAlert: {
        id: "automations.icon.tooltip.header.alert",
    },
    automationIconTooltipHeaderSchedule: {
        id: "automations.icon.tooltip.header.schedule",
    },
    automationIconTooltipStatus: {
        id: "automations.icon.tooltip.status",
    },
    automationIconTooltipTraceId: {
        id: "automations.icon.tooltip.traceId",
    },
    // Confirm Dialog messages
    confirmDialogDeleteScheduleHeadline: {
        id: "automations.confirmDialog.delete.schedule.headline",
    },
    confirmDialogDeleteScheduleContent: {
        id: "automations.confirmDialog.delete.schedule.content",
    },
    confirmDialogDeleteAlertHeadline: {
        id: "automations.confirmDialog.delete.alert.headline",
    },
    confirmDialogDeleteAlertContent: {
        id: "automations.confirmDialog.delete.alert.content",
    },
    confirmDialogUnsubscribeScheduleHeadline: {
        id: "automations.confirmDialog.unsubscribe.schedule.headline",
    },
    confirmDialogUnsubscribeScheduleContent: {
        id: "automations.confirmDialog.unsubscribe.schedule.content",
    },
    confirmDialogUnsubscribeAlertHeadline: {
        id: "automations.confirmDialog.unsubscribe.alert.headline",
    },
    confirmDialogUnsubscribeAlertContent: {
        id: "automations.confirmDialog.unsubscribe.alert.content",
    },
    confirmDialogBulkDeleteScheduleHeadline: {
        id: "automations.confirmDialog.bulkDelete.schedule.headline",
    },
    confirmDialogBulkDeleteScheduleContent: {
        id: "automations.confirmDialog.bulkDelete.schedule.content",
    },
    confirmDialogBulkDeleteAlertHeadline: {
        id: "automations.confirmDialog.bulkDelete.alert.headline",
    },
    confirmDialogBulkDeleteAlertContent: {
        id: "automations.confirmDialog.bulkDelete.alert.content",
    },
    confirmDialogBulkUnsubscribeScheduleHeadline: {
        id: "automations.confirmDialog.bulkUnsubscribe.schedule.headline",
    },
    confirmDialogBulkUnsubscribeScheduleContent: {
        id: "automations.confirmDialog.bulkUnsubscribe.schedule.content",
    },
    confirmDialogBulkUnsubscribeAlertHeadline: {
        id: "automations.confirmDialog.bulkUnsubscribe.alert.headline",
    },
    confirmDialogBulkUnsubscribeAlertContent: {
        id: "automations.confirmDialog.bulkUnsubscribe.alert.content",
    },
    confirmDialogPauseScheduleHeadline: {
        id: "automations.confirmDialog.pause.schedule.headline",
    },
    confirmDialogPauseScheduleContent: {
        id: "automations.confirmDialog.pause.schedule.content",
    },
    confirmDialogPauseAlertHeadline: {
        id: "automations.confirmDialog.pause.alert.headline",
    },
    confirmDialogPauseAlertContent: {
        id: "automations.confirmDialog.pause.alert.content",
    },
    confirmDialogResumeScheduleHeadline: {
        id: "automations.confirmDialog.resume.schedule.headline",
    },
    confirmDialogResumeScheduleContent: {
        id: "automations.confirmDialog.resume.schedule.content",
    },
    confirmDialogResumeAlertHeadline: {
        id: "automations.confirmDialog.resume.alert.headline",
    },
    confirmDialogResumeAlertContent: {
        id: "automations.confirmDialog.resume.alert.content",
    },
    confirmDialogBulkPauseScheduleHeadline: {
        id: "automations.confirmDialog.bulkPause.schedule.headline",
    },
    confirmDialogBulkPauseScheduleContent: {
        id: "automations.confirmDialog.bulkPause.schedule.content",
    },
    confirmDialogBulkPauseAlertHeadline: {
        id: "automations.confirmDialog.bulkPause.alert.headline",
    },
    confirmDialogBulkPauseAlertContent: {
        id: "automations.confirmDialog.bulkPause.alert.content",
    },
    confirmDialogBulkResumeScheduleHeadline: {
        id: "automations.confirmDialog.bulkResume.schedule.headline",
    },
    confirmDialogBulkResumeScheduleContent: {
        id: "automations.confirmDialog.bulkResume.schedule.content",
    },
    confirmDialogBulkResumeAlertHeadline: {
        id: "automations.confirmDialog.bulkResume.alert.headline",
    },
    confirmDialogBulkResumeAlertContent: {
        id: "automations.confirmDialog.bulkResume.alert.content",
    },
    confirmDialogButtonDelete: {
        id: "automations.confirmDialog.button.delete",
    },
    confirmDialogButtonConfirm: {
        id: "automations.confirmDialog.button.confirm",
    },
    confirmDialogButtonCancel: {
        id: "automations.confirmDialog.button.cancel",
    },
    // Empty state messages
    emptyStateScheduleTitle: {
        id: "automations.emptyState.schedule.title",
    },
    emptyStateScheduleDescription: {
        id: "automations.emptyState.schedule.description",
    },
    emptyStateAlertTitle: {
        id: "automations.emptyState.alert.title",
    },
    emptyStateAlertDescription: {
        id: "automations.emptyState.alert.description",
    },
    // Accessibility messages
    accessibilitySelectAllAlerts: {
        id: "automations.accessibility.selectAll.alerts",
    },
    accessibilitySelectAllSchedules: {
        id: "automations.accessibility.selectAll.schedules",
    },
    accessibilitySelectAlert: {
        id: "automations.accessibility.select.alert",
    },
    accessibilitySelectSchedule: {
        id: "automations.accessibility.select.schedule",
    },
    accessibilitySearchAlerts: {
        id: "automations.accessibility.search.alerts",
    },
    accessibilitySearchSchedules: {
        id: "automations.accessibility.search.schedules",
    },
    accessibilityGridLabelAlerts: {
        id: "automations.accessibility.gridLabel.alerts",
    },
    accessibilityGridLabelSchedules: {
        id: "automations.accessibility.gridLabel.schedules",
    },
});

export const getActionMessages = (type: AutomationsType) => {
    if (type === "schedule") {
        return {
            messageDeleteSuccess: messages.messageScheduleDeleteSuccess,
            messageDeleteError: messages.messageScheduleDeleteError,
            messageUnsubscribeSuccess: messages.messageScheduleUnsubscribeSuccess,
            messageUnsubscribeError: messages.messageScheduleUnsubscribeError,

            messageBulkDeleteSuccess: messages.messageScheduleBulkDeleteSuccess,
            messageBulkDeleteError: messages.messageScheduleBulkDeleteError,
            messageBulkUnsubscribeSuccess: messages.messageScheduleBulkUnsubscribeSuccess,
            messageBulkUnsubscribeError: messages.messageScheduleBulkUnsubscribeError,

            messagePauseSuccess: messages.messageSchedulePauseSuccess,
            messagePauseError: messages.messageSchedulePauseError,
            messageBulkPauseSuccess: messages.messageScheduleBulkPauseSuccess,
            messageBulkPauseError: messages.messageScheduleBulkPauseError,

            messageResumeSuccess: messages.messageScheduleResumeSuccess,
            messageResumeError: messages.messageScheduleResumeError,
            messageBulkResumeSuccess: messages.messageScheduleBulkResumeSuccess,
            messageBulkResumeError: messages.messageScheduleBulkResumeError,
        };
    }
    return {
        messageDeleteSuccess: messages.messageAlertDeleteSuccess,
        messageDeleteError: messages.messageAlertDeleteError,
        messageUnsubscribeSuccess: messages.messageAlertUnsubscribeSuccess,
        messageUnsubscribeError: messages.messageAlertUnsubscribeError,

        messageBulkDeleteSuccess: messages.messageAlertBulkDeleteSuccess,
        messageBulkDeleteError: messages.messageAlertBulkDeleteError,
        messageBulkUnsubscribeSuccess: messages.messageAlertBulkUnsubscribeSuccess,
        messageBulkUnsubscribeError: messages.messageAlertBulkUnsubscribeError,

        messagePauseSuccess: messages.messageAlertPauseSuccess,
        messagePauseError: messages.messageAlertPauseError,
        messageBulkPauseSuccess: messages.messageAlertBulkPauseSuccess,
        messageBulkPauseError: messages.messageAlertBulkPauseError,

        messageResumeSuccess: messages.messageAlertResumeSuccess,
        messageResumeError: messages.messageAlertResumeError,
        messageBulkResumeSuccess: messages.messageAlertBulkResumeSuccess,
        messageBulkResumeError: messages.messageAlertBulkResumeError,
    };
};
