// (C) 2021-2024 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import compact from "lodash/compact.js";

import { IInsightMenuItem } from "../types.js";
import { InsightAlerts } from "../../insight/configuration/InsightAlerts.js";
import { ExportOptions } from "../../insight/configuration/ExportOptions.js";

/**
 * @internal
 */
export type SchedulingDisabledReason = "incompatibleWidget" | "oldWidget" | "disabledOnInsight";

/**
 * @internal
 */
export type AlertingDisabledReason = "noDestinations" | "oldWidget" | "disabledOnInsight";

/**
 * @internal
 */
export function getDefaultInsightMenuItems(
    intl: IntlShape,
    config: {
        exportXLSXDisabled: boolean;
        exportCSVDisabled: boolean;
        scheduleExportDisabled: boolean;
        scheduleExportDisabledReason?: SchedulingDisabledReason;
        scheduleExportManagementDisabled: boolean;
        onExportXLSX: () => void;
        onExportCSV: () => void;
        onScheduleExport: () => void;
        onScheduleManagementExport: () => void;
        isExportRawVisible: boolean;
        isScheduleExportVisible: boolean;
        isScheduleExportManagementVisible: boolean;
        isDataError: boolean;
        isAlertingVisible: boolean;
        alertingDisabled: boolean;
        alertingDisabledReason?: AlertingDisabledReason;
        canCreateAutomation: boolean;
    },
): IInsightMenuItem[] {
    const {
        exportCSVDisabled,
        exportXLSXDisabled,
        scheduleExportDisabled,
        scheduleExportDisabledReason,
        scheduleExportManagementDisabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        isDataError,
        isAlertingVisible,
        alertingDisabled,
        alertingDisabledReason,
        canCreateAutomation,
        isExportRawVisible,
    } = config;

    const defaultWidgetTooltip = isDataError
        ? intl.formatMessage({ id: "options.menu.unsupported.error" })
        : intl.formatMessage({ id: "options.menu.unsupported.loading" });
    const oldWidgetTooltip = intl.formatMessage({
        id: "options.menu.unsupported.oldWidget",
    });
    const alertingOldWidgetTooltip = intl.formatMessage({
        id: "options.menu.unsupported.alertingOldWidget",
    });
    const incompatibleWidgetTooltip = intl.formatMessage({
        id: "options.menu.unsupported.incompatibleWidget",
    });
    const schedulingForInsightNotEnabledTooltip = intl.formatMessage({
        id: "options.menu.unsupported.schedulingForInsightNotEnabled",
    });
    const alertingForInsightNotEnabledTooltip = intl.formatMessage({
        id: "options.menu.unsupported.alertingForInsightNotEnabled",
    });
    const noDestinationsTooltip = intl.formatMessage(
        { id: "insightAlert.noDestination.tooltip" },
        {
            a: (chunk: React.ReactNode) => (
                <a href="/settings" rel="noopener noreferrer" target="_blank">
                    {chunk}
                </a>
            ),
        },
    );

    const isSomeScheduleVisible =
        (isScheduleExportVisible && !scheduleExportDisabled) ||
        (isScheduleExportManagementVisible && !scheduleExportManagementDisabled);

    const menuItems: (false | IInsightMenuItem)[] = [
        isExportRawVisible && {
            type: "submenu",
            itemId: "Exports",
            itemName: intl.formatMessage({ id: "widget.options.menu.export" }),
            icon: "gd-icon-download",
            className: "s-options-menu-exports",
            SubmenuComponent: ExportOptions,
        },
        !isExportRawVisible && {
            type: "button",
            itemId: "ExportXLSXBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToXLSX" }),
            onClick: onExportXLSX,
            disabled: exportXLSXDisabled,
            tooltip: defaultWidgetTooltip,
            icon: "gd-icon-download",
            className: "s-options-menu-export-xlsx",
        },
        !isExportRawVisible && {
            type: "button",
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV" }),
            onClick: onExportCSV,
            disabled: exportCSVDisabled,
            tooltip: defaultWidgetTooltip,
            icon: "gd-icon-download",
            className: "s-options-menu-export-csv",
        },
        isAlertingVisible && {
            itemId: "AlertingSeparator",
            type: "separator",
        },
        isAlertingVisible && {
            type: "submenu",
            itemId: "Alerts",
            itemName: intl.formatMessage({ id: "widget.options.menu.alerts" }),
            icon: "gd-icon-bell",
            className: "s-options-menu-alerting",
            SubmenuComponent: InsightAlerts,
            renderSubmenuComponentOnly: true,
            tooltip:
                alertingDisabledReason === "oldWidget"
                    ? alertingOldWidgetTooltip
                    : alertingDisabledReason === "noDestinations"
                    ? noDestinationsTooltip
                    : alertingDisabledReason === "disabledOnInsight"
                    ? alertingForInsightNotEnabledTooltip
                    : undefined,
            disabled: alertingDisabled,
        },
        isSomeScheduleVisible && {
            itemId: "SchedulingSeparator",
            type: "separator",
        },
        isScheduleExportVisible && {
            type: "button",
            itemId: "ScheduleExport",
            itemName: intl.formatMessage({ id: "widget.options.menu.scheduleExport" }),
            onClick: onScheduleExport,
            disabled: scheduleExportDisabled,
            tooltip:
                scheduleExportDisabledReason === "incompatibleWidget"
                    ? incompatibleWidgetTooltip
                    : scheduleExportDisabledReason === "oldWidget"
                    ? oldWidgetTooltip
                    : scheduleExportDisabledReason === "disabledOnInsight"
                    ? schedulingForInsightNotEnabledTooltip
                    : undefined,
            icon: "gd-icon-clock",
            className: "s-options-menu-schedule-export",
        },
        isScheduleExportManagementVisible && {
            type: "button",
            itemId: "ScheduleExportEdit",
            itemName: canCreateAutomation
                ? intl.formatMessage({ id: "widget.options.menu.scheduleExport.edit" })
                : intl.formatMessage({ id: "options.menu.schedule.email.edit.noCreatePermissions" }),
            onClick: onScheduleManagementExport,
            disabled: scheduleExportManagementDisabled,
            tooltip: defaultWidgetTooltip,
            icon: canCreateAutomation ? "gd-icon-list" : "gd-icon-clock",
            className: "s-options-menu-schedule-export-edit",
        },
    ];

    return compact(menuItems);
}
