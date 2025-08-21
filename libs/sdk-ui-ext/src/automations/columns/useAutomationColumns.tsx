// (C) 2025 GoodData Corporation

import React, { useMemo } from "react";

import { useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useWorkspace } from "@gooddata/sdk-ui";
import { UiAsyncTableColumn } from "@gooddata/sdk-ui-kit";

import { AutomationIcon } from "./AutomationIcon.js";
import { AutomationMenu } from "./AutomationMenu.js";
import { DEFAULT_COLUMN_WIDTHS } from "../constants.js";
import { formatAlertSubtitle, formatAttachments, formatAutomationUser, formatCellValue } from "../format.js";
import { messages } from "../messages.js";
import {
    AutomationColumnDefinition,
    AutomationsColumnName,
    AutomationsType,
    IAutomationsPendingAction,
    IDashboardUrlBuilder,
    IEditAutomation,
    IWidgetUrlBuilder,
} from "../types.js";
import { useUser } from "../UserContext.js";

export const useAutomationColumns = ({
    type,
    timezone,
    columnDefinitions,
    automationsType,
    deleteAutomation,
    unsubscribeFromAutomation,
    dashboardUrlBuilder,
    widgetUrlBuilder,
    editAutomation,
    setPendingAction,
}: {
    type: AutomationsType;
    timezone?: string;
    columnDefinitions: Array<AutomationColumnDefinition>;
    automationsType: AutomationsType;
    deleteAutomation: (automationId: string) => void;
    unsubscribeFromAutomation: (automationId: string) => void;
    dashboardUrlBuilder: IDashboardUrlBuilder;
    widgetUrlBuilder: IWidgetUrlBuilder;
    editAutomation: IEditAutomation;
    setPendingAction: (pendingAction: IAutomationsPendingAction | undefined) => void;
}): { columns: UiAsyncTableColumn<IAutomationMetadataObject>[]; includeAutomationResult: boolean } => {
    const workspace = useWorkspace();
    const intl = useIntl();
    const { canManageAutomation, isSubscribedToAutomation } = useUser();

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
                renderRoleIcon: () => <AutomationIcon type={type} />,
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
                getTextHref: (item) => dashboardUrlBuilder(workspace, item.dashboard?.id),
                width: DEFAULT_COLUMN_WIDTHS.DASHBOARD,
            },
            ["widget"]: {
                label: intl.formatMessage(messages.columnWidget),
                getTextContent: () => intl.formatMessage(messages.columnWidget),
                getTextHref: (item) => {
                    return widgetUrlBuilder(workspace, item.dashboard?.id, item?.metadata?.widget);
                },
                width: DEFAULT_COLUMN_WIDTHS.WIDGET,
            },
            ["attachments"]: {
                label: intl.formatMessage(messages.columnAttachments),
                getTextContent: (item) => formatCellValue(formatAttachments(item.exportDefinitions)),
                width: DEFAULT_COLUMN_WIDTHS.ATTACHMENTS,
            },
            ["recipients"]: {
                key: "recipients",
                label: intl.formatMessage(messages.columnRecipients),
                getTextContent: (item) => formatCellValue(item.recipients?.length, "number"),
                getTextTitle: (item) =>
                    formatCellValue(item.recipients?.map((recipient) => recipient.name).join(", ")),
                width: DEFAULT_COLUMN_WIDTHS.RECIPIENTS,
            },
            ["lastRun"]: {
                label: intl.formatMessage(messages.columnLastSent),
                getTextContent: (item) => formatCellValue(item.lastRun?.executedAt, "date", timezone),
                renderPrefixIcon: (item) => {
                    return AutomationIcon({ type: item.lastRun?.status, automation: item });
                },
                width: DEFAULT_COLUMN_WIDTHS.LAST_SENT,
            },
            ["lastRunStatus"]: {
                label: intl.formatMessage(messages.columnState),
                getTextContent: (item) => formatCellValue(item.lastRun?.status),
                width: DEFAULT_COLUMN_WIDTHS.STATE,
            },
            ["createdBy"]: {
                key: "createdBy",
                label: intl.formatMessage(messages.columnCreatedBy),
                getTextContent: (item) => formatCellValue(formatAutomationUser(item.createdBy)),
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
                    const isSubscribed = isSubscribedToAutomation(item);
                    return (
                        <AutomationMenu
                            item={item}
                            editAutomation={editAutomation}
                            deleteAutomation={deleteAutomation}
                            unsubscribeFromAutomation={unsubscribeFromAutomation}
                            setPendingAction={setPendingAction}
                            workspace={workspace}
                            canManage={canManage}
                            isSubscribed={isSubscribed}
                            closeDropdown={closeDropdown}
                            automationsType={automationsType}
                        />
                    );
                },
            },
        }),
        [
            workspace,
            type,
            intl,
            timezone,
            canManageAutomation,
            deleteAutomation,
            dashboardUrlBuilder,
            widgetUrlBuilder,
            isSubscribedToAutomation,
            unsubscribeFromAutomation,
            editAutomation,
            setPendingAction,
            automationsType,
        ],
    );

    const columns = useMemo(() => {
        return columnDefinitions.map((columnDef) => {
            const selectedColumn = allColumns[columnDef.name];
            return { ...selectedColumn, width: columnDef.width ?? selectedColumn.width };
        });
    }, [allColumns, columnDefinitions]);

    const includeAutomationResult = useMemo(() => {
        return columnDefinitions.some(
            (columnDef) => columnDef.name === "lastRun" || columnDef.name === "lastRunStatus",
        );
    }, [columnDefinitions]);

    return { columns, includeAutomationResult };
};
