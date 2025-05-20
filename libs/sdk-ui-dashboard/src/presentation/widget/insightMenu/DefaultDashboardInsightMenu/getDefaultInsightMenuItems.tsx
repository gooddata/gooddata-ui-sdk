// (C) 2021-2025 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import compact from "lodash/compact.js";

import { IInsightMenuItem } from "../types.js";
import { InsightAlerts } from "../../insight/configuration/InsightAlerts.js";
import { ISettings } from "@gooddata/sdk-model";
import { IExecutionResultEnvelope } from "../../../../model/index.js";
import { isDataErrorTooLarge, isDataError } from "../../../../_staging/errors/errorPredicates.js";

/**
 * @internal
 */
export type SchedulingDisabledReason = "incompatibleWidget" | "oldWidget" | "disabledOnInsight";

/**
 * @internal
 */
export type AlertingDisabledReason = "noDestinations" | "oldWidget" | "disabledOnInsight";

const getExportTooltip = (execution?: IExecutionResultEnvelope, enableRawExports?: boolean): string => {
    if (isDataErrorTooLarge(execution?.error)) {
        return "options.menu.data.too.large";
    } else if (isDataError(execution?.error)) {
        if (enableRawExports) {
            return "options.menu.unsupported.raw.error";
        } else {
            return "options.menu.unsupported.error";
        }
    }
    return "options.menu.unsupported.loading";
};

const getExportMenuItems = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    execution?: IExecutionResultEnvelope,
    settings?: ISettings,
): IInsightMenuItem[] => {
    const {
        isExportVisible,
        isExportRawVisible,
        isExportPngImageVisible,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportXLSXDisabled,
        exportCSVDisabled,
        exportCSVRawDisabled,
        exportPngImageDisabled,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportXLSX,
        onExportCSV,
        onExportRawCSV,
        onExportPngImage,
    } = config;
    const tooltip = getExportTooltip(execution, settings?.enableRawExports);
    const presentationTooltip = intl.formatMessage({
        id: "options.menu.export.presentation.unsupported.oldWidget",
    });

    console.log("isExportPngImageVisible", isExportPngImageVisible);
    return [
        // Presentation exports section - only shown if isExportVisible is true
        ...(isExportVisible
            ? [
                  ...(isExportPngImageVisible
                      ? [
                            {
                                type: "button" as const,
                                itemId: "ExportPngImage",
                                itemName: intl.formatMessage({ id: "options.menu.export.image.PNG" }),
                                icon: "gd-icon-type-image",
                                className: "gd-export-options-png",
                                disabled: exportPngImageDisabled,
                                tooltip: exportPngImageDisabled ? presentationTooltip : undefined,
                                onClick: onExportPngImage,
                            },
                        ]
                      : []),
                  {
                      type: "button" as const,
                      itemId: "ExportPdfPresentation",
                      itemName: intl.formatMessage({ id: "options.menu.export.presentation.PDF" }),
                      icon: "gd-icon-type-pdf",
                      className: "gd-export-options-pdf-presentation",
                      disabled: exportPdfPresentationDisabled,
                      tooltip: exportPdfPresentationDisabled ? presentationTooltip : undefined,
                      onClick: onExportPdfPresentation,
                  },
                  {
                      type: "button" as const,
                      itemId: "ExportPptxPresentation",
                      itemName: intl.formatMessage({ id: "options.menu.export.presentation.PPTX" }),
                      icon: "gd-icon-type-slides",
                      className: "gd-export-options-pptx-presentation",
                      disabled: exportPowerPointPresentationDisabled,
                      tooltip: exportPowerPointPresentationDisabled ? presentationTooltip : undefined,
                      onClick: onExportPowerPointPresentation,
                  },
              ]
            : []),

        // Data exports section - only shown if isExportRawVisible is true
        ...(isExportRawVisible
            ? [
                  {
                      type: "group" as const,
                      itemId: "ExportGroup",
                      itemName: intl.formatMessage({ id: "options.menu.export.header.data" }),
                      items: [
                          {
                              type: "button" as const,
                              itemId: "ExportXLSX",
                              itemName: intl.formatMessage({ id: "widget.options.menu.XLSX" }),
                              icon: "gd-icon-type-sheet",
                              className: "gd-export-options-xlsx",
                              disabled: exportXLSXDisabled,
                              tooltip: exportXLSXDisabled ? tooltip : undefined,
                              onClick: onExportXLSX,
                          },
                          {
                              type: "button" as const,
                              itemId: "ExportCSVFormatted",
                              itemName: intl.formatMessage({
                                  id: "widget.options.menu.exportToCSV.formatted",
                              }),
                              icon: "gd-icon-type-csv-formatted",
                              className: "gd-export-options-csv",
                              disabled: exportCSVDisabled,
                              tooltip: exportCSVDisabled ? tooltip : undefined,
                              onClick: onExportCSV,
                          },
                          {
                              type: "button" as const,
                              itemId: "ExportCSVRaw",
                              itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV.raw" }),
                              icon: "gd-icon-type-csv-raw",
                              className: "gd-export-options-csv-raw",
                              disabled: exportCSVRawDisabled,
                              tooltip: exportCSVRawDisabled ? tooltip : undefined,
                              onClick: onExportRawCSV,
                          },
                      ],
                  },
              ]
            : []),
    ];
};

/**
 * @internal
 */
export interface IUseInsightMenuConfig {
    exportXLSXDisabled: boolean;
    exportCSVDisabled: boolean;
    exportCSVRawDisabled: boolean;
    isExporting: boolean;
    scheduleExportDisabled: boolean;
    scheduleExportDisabledReason?: SchedulingDisabledReason;
    scheduleExportManagementDisabled: boolean;
    exportPdfPresentationDisabled: boolean;
    exportPowerPointPresentationDisabled: boolean;
    exportPngImageDisabled: boolean;
    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportRawCSV: () => void;
    onScheduleExport: () => void;
    onScheduleManagementExport: () => void;
    onExportPowerPointPresentation: () => void;
    onExportPdfPresentation: () => void;
    onExportPngImage: () => void;
    isExportRawVisible: boolean;
    isExportVisible: boolean;
    isExportPngImageVisible: boolean;
    isScheduleExportVisible: boolean;
    isScheduleExportManagementVisible: boolean;
    isDataError: boolean;
    isAlertingVisible: boolean;
    alertingDisabled: boolean;
    alertingDisabledReason?: AlertingDisabledReason;
    canCreateAutomation: boolean;
}

/**
 * @internal
 */
export function getDefaultInsightMenuItems(
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    execution?: IExecutionResultEnvelope,
    settings?: ISettings,
): IInsightMenuItem[] {
    const {
        exportCSVDisabled,
        exportXLSXDisabled,

        isExporting,
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
        isExportVisible,
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
    const exportDisabledTooltip = intl.formatMessage({
        id: "options.menu.export.in.progress",
    });

    const exportMenuItems = getExportMenuItems(intl, config, execution, settings);

    const isSomeScheduleVisible =
        (isScheduleExportVisible && !scheduleExportDisabled) ||
        (isScheduleExportManagementVisible && !scheduleExportManagementDisabled);

    const menuItems: (false | IInsightMenuItem)[] = [
        (isExportRawVisible || isExportVisible) && {
            type: "submenu",
            itemId: "Exports",
            itemName: intl.formatMessage({ id: "widget.options.menu.export" }),
            icon: "gd-icon-download",
            className: "s-options-menu-exports",
            disabled: isExporting,
            tooltip: exportDisabledTooltip,
            items: exportMenuItems,
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
