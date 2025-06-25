// (C) 2025 GoodData Corporation

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { IColumn, Item, ItemsWrapper, Separator } from "@gooddata/sdk-ui-kit";
import { useWorkspace } from "@gooddata/sdk-ui";
import React, { useMemo } from "react";
import { AutomationColumnDefinition, AutomationsColumnName, AutomationsType } from "../types.js";
import { useIntl } from "react-intl";
import { AutomationIcon } from "./AutomationIcon.js";
import { buildAlertSubtitle, buildDashboardUrl, formatDate } from "../utils.js";
import { messages } from "../messages.js";
import { DEFAULT_COLUMN_WIDTHS } from "../constants.js";

export const useAutomationColumns = (
    type: AutomationsType,
    columnDefinitions: Array<AutomationColumnDefinition>,
): IColumn<IAutomationMetadataObject>[] => {
    const workspace = useWorkspace();
    const intl = useIntl();

    const allColumns = useMemo(
        (): Partial<Record<AutomationsColumnName, IColumn<IAutomationMetadataObject>>> => ({
            ["id"]: {
                key: "id",
                label: intl.formatMessage(messages.columnId),
                width: DEFAULT_COLUMN_WIDTHS.ID,
            },
            ["name"]: {
                label: intl.formatMessage(messages.columnName),
                key: "title",
                renderRoleIcon: () => {
                    return AutomationIcon({ type });
                },
                getMultiLineTextContent: (item) => [
                    String(item.title),
                    type === "schedule"
                        ? String(item.schedule?.cronDescription)
                        : String(buildAlertSubtitle(intl, item.alert)),
                ],
                sortable: true,
                width: DEFAULT_COLUMN_WIDTHS.NAME,
            },
            ["dashboard"]: {
                key: "dashboard",
                label: intl.formatMessage(messages.columnDashboard),
                getTextContent: (item) => item.dashboard,
                getTextHref: (item) => buildDashboardUrl(workspace, item.dashboard),
                width: DEFAULT_COLUMN_WIDTHS.DASHBOARD,
            },
            ["recipients"]: {
                key: "recipients",
                label: intl.formatMessage(messages.columnRecipients),
                getTextContent: (item) => String(item.recipients?.length),
                getTextTitle: (item) => item.recipients?.map((recipient) => recipient.name).join(", "),
                width: DEFAULT_COLUMN_WIDTHS.RECIPIENTS,
            },
            ["lastSent"]: {
                label: intl.formatMessage(messages.columnLastSent),
                getTextContent: (item) => String(formatDate(item.schedule?.firstRun ?? item.created, intl)),
                width: DEFAULT_COLUMN_WIDTHS.LAST_SENT,
            },
            ["state"]: {
                label: intl.formatMessage(messages.columnState),
                width: DEFAULT_COLUMN_WIDTHS.STATE,
            },
            ["createdBy"]: {
                key: "createdBy",
                label: intl.formatMessage(messages.columnCreatedBy),
                getTextContent: (item) => String(item.createdBy.fullName),
                width: DEFAULT_COLUMN_WIDTHS.CREATED_BY,
            },
            ["createdAt"]: {
                key: "created",
                label: intl.formatMessage(messages.columnCreatedAt),
                getTextContent: (item) => String(formatDate(item.created, intl)),
                width: DEFAULT_COLUMN_WIDTHS.CREATED_AT,
            },
            ["notificationChannel"]: {
                key: "notificationChannel",
                label: intl.formatMessage(messages.columnNotificationChannel),
                getTextContent: (item) => String(item.notificationChannel),
                width: DEFAULT_COLUMN_WIDTHS.NOTIFICATION_CHANNEL,
            },
            ["menu"]: {
                renderMenu: () => {
                    return (
                        <ItemsWrapper smallItemsSpacing>
                            <Item>{intl.formatMessage(messages.menuEdit)}</Item>
                            <Separator />
                            <Item>{intl.formatMessage(messages.menuDelete)}</Item>
                        </ItemsWrapper>
                    );
                },
            },
        }),
        [workspace, type, intl],
    );

    return useMemo(() => {
        return columnDefinitions.map((columnDef) => {
            const selectedColumn = allColumns[columnDef.name];
            return { ...selectedColumn, width: columnDef.width ?? selectedColumn.width };
        });
    }, [allColumns, columnDefinitions]);
};
