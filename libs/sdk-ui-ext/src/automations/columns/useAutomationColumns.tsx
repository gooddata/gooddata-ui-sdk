// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useWorkspace } from "@gooddata/sdk-ui";
import { UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { AutomationIcon } from "./AutomationIcon.js";
import { AutomationMenu } from "./AutomationMenu.js";
import { DEFAULT_COLUMN_WIDTHS } from "../constants.js";
import { formatAlertSubtitle, formatAttachments, formatAutomationUser, formatCellValue } from "../format.js";
import { messages } from "../messages.js";
import { AutomationsColumnName, IUseAutomationColumnsProps } from "../types.js";
import { useUser } from "../UserContext.js";
import {
    getNextRunFromCron,
    getRecipientName,
    getWidgetId,
    getWidgetName,
    getWorkspaceId,
} from "../utils.js";

export const useAutomationColumns = ({
    type,
    timezone,
    selectedColumnDefinitions,
    automationsType,
    deleteAutomation,
    unsubscribeFromAutomation,
    pauseAutomation,
    resumeAutomation,
    dashboardUrlBuilder,
    widgetUrlBuilder,
    editAutomation,
    setPendingAction,
}: IUseAutomationColumnsProps): {
    columns: UiAsyncTableColumn<IAutomationMetadataObject>[];
    includeAutomationResult: boolean;
} => {
    const workspace = useWorkspace();
    const intl = useIntl();
    const { canManageAutomation, isSubscribedToAutomation, canPauseAutomation, canResumeAutomation } =
        useUser();

    const allColumns = useMemo(
        (): Partial<Record<AutomationsColumnName, UiAsyncTableColumn<IAutomationMetadataObject>>> => ({
            ["id"]: {
                key: "id",
                label: intl.formatMessage(messages.columnId),
                width: DEFAULT_COLUMN_WIDTHS.ID,
            },
            ["title"]: {
                label: intl.formatMessage(messages.columnName),
                key: "title",
                renderRoleIcon: (item) => <AutomationIcon type={type} state={item.state} />,
                getMultiLineTextContent: (item) => [
                    formatCellValue(item.title),
                    formatCellValue(
                        type === "schedule"
                            ? item.schedule?.cronDescription
                            : formatAlertSubtitle(intl, item.alert),
                    ),
                ],
                sortable: true,
                width: DEFAULT_COLUMN_WIDTHS.NAME,
            },
            ["dashboard"]: {
                key: "dashboard",
                label: intl.formatMessage(messages.columnDashboard),
                getTextContent: (item) => formatCellValue(item.dashboard?.title),
                getTextHref: (item) =>
                    dashboardUrlBuilder(getWorkspaceId(item, workspace), item.dashboard?.id),
                width: DEFAULT_COLUMN_WIDTHS.DASHBOARD,
            },
            ["workspace"]: {
                label: intl.formatMessage(messages.columnWorkspace),
                getTextContent: (item) => formatCellValue(item.workspace?.title),
                width: DEFAULT_COLUMN_WIDTHS.WORKSPACE,
            },
            ["widget"]: {
                label: intl.formatMessage(messages.columnWidget),
                getTextContent: (item) => formatCellValue(getWidgetName(item, type)),
                getTextHref: (item) => {
                    return widgetUrlBuilder(
                        getWorkspaceId(item, workspace),
                        item.dashboard?.id,
                        getWidgetId(item, type),
                    );
                },
                width: DEFAULT_COLUMN_WIDTHS.WIDGET,
            },
            ["attachments"]: {
                label: intl.formatMessage(messages.columnAttachments),
                getTextContent: (item) => formatCellValue(formatAttachments(item.exportDefinitions)),
                width: DEFAULT_COLUMN_WIDTHS.ATTACHMENTS,
            },
            ["nextRun"]: {
                label: intl.formatMessage(messages.columnNextRun),
                getTextContent: (item) =>
                    formatCellValue(getNextRunFromCron(item.schedule?.cron), "date", timezone),
                width: DEFAULT_COLUMN_WIDTHS.NEXT_RUN,
            },
            ["recipients"]: {
                key: "recipients",
                label: intl.formatMessage(messages.columnRecipients),
                getTextContent: (item) => formatCellValue(item.recipients?.length, "number"),
                getTextTitle: (item) =>
                    formatCellValue(
                        item.recipients?.map((recipient) => getRecipientName(recipient)).join(", "),
                    ),
                width: DEFAULT_COLUMN_WIDTHS.RECIPIENTS,
            },
            ["lastRun"]: {
                label: intl.formatMessage(messages.columnLastSent),
                getTextContent: (item) => {
                    if (item.lastRun?.executedAt) {
                        return formatCellValue(item.lastRun?.executedAt, "date", timezone);
                    }
                    return intl.formatMessage(messages.cellLastRunNever);
                },
                renderPrefixIcon: (item) => {
                    return AutomationIcon({ type: item.lastRun?.status, automation: item });
                },
                width: DEFAULT_COLUMN_WIDTHS.LAST_SENT,
            },
            ["lastRunStatus"]: {
                label: intl.formatMessage(messages.columnLastRunStatus),
                getTextContent: (item) => formatCellValue(item.lastRun?.status),
                width: DEFAULT_COLUMN_WIDTHS.LAST_RUN_STATUS,
            },
            ["state"]: {
                label: intl.formatMessage(messages.columnState),
                getTextContent: (item) => formatCellValue(item.state),
                width: DEFAULT_COLUMN_WIDTHS.STATE,
            },
            ["createdBy"]: {
                key: "createdBy",
                label: intl.formatMessage(messages.columnCreatedBy),
                getTextContent: (item) => formatCellValue(formatAutomationUser(item.createdBy)),
                getTextTitle: (item) => formatCellValue(item.createdBy?.email),
                width: DEFAULT_COLUMN_WIDTHS.CREATED_BY,
            },
            ["createdAt"]: {
                key: "created",
                label: intl.formatMessage(messages.columnCreatedAt),
                getTextContent: (item) => formatCellValue(item.created, "date", timezone),
                width: DEFAULT_COLUMN_WIDTHS.CREATED_AT,
            },
            ["notificationChannel"]: {
                key: "notificationChannel",
                label: intl.formatMessage(messages.columnNotificationChannel),
                getTextContent: (item) => formatCellValue(item.notificationChannel),
                width: DEFAULT_COLUMN_WIDTHS.NOTIFICATION_CHANNEL,
            },
            ["menu"]: {
                renderMenu: (item, closeDropdown) => {
                    const canManage = canManageAutomation(item);
                    const canPause = canPauseAutomation(item);
                    const canResume = canResumeAutomation(item);
                    const isSubscribed = isSubscribedToAutomation(item);
                    return (
                        <AutomationMenu
                            item={item}
                            editAutomation={editAutomation}
                            deleteAutomation={deleteAutomation}
                            unsubscribeFromAutomation={unsubscribeFromAutomation}
                            pauseAutomation={pauseAutomation}
                            resumeAutomation={resumeAutomation}
                            setPendingAction={setPendingAction}
                            workspace={workspace}
                            canManage={canManage}
                            isSubscribed={isSubscribed}
                            canPause={canPause}
                            canResume={canResume}
                            closeDropdown={closeDropdown}
                            automationsType={automationsType}
                        />
                    );
                },
            },
        }),
        [
            intl,
            type,
            dashboardUrlBuilder,
            workspace,
            widgetUrlBuilder,
            timezone,
            canManageAutomation,
            isSubscribedToAutomation,
            editAutomation,
            deleteAutomation,
            unsubscribeFromAutomation,
            pauseAutomation,
            resumeAutomation,
            setPendingAction,
            canPauseAutomation,
            canResumeAutomation,
            automationsType,
        ],
    );

    const columns = useMemo(() => {
        return selectedColumnDefinitions.map((columnDef) => {
            const selectedColumn = allColumns[columnDef.name];
            return { ...selectedColumn, width: columnDef.width ?? selectedColumn.width };
        });
    }, [allColumns, selectedColumnDefinitions]);

    const includeAutomationResult = useMemo(() => {
        return selectedColumnDefinitions.some(
            (columnDef) => columnDef.name === "lastRun" || columnDef.name === "lastRunStatus",
        );
    }, [selectedColumnDefinitions]);

    return { columns, includeAutomationResult };
};
