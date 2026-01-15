// (C) 2021-2026 GoodData Corporation

import { type ReactNode } from "react";

import { compact } from "lodash-es";
import { type IntlShape } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { getExportTooltipId } from "./getExportTooltips.js";
import { type IUseInsightMenuConfig } from "./types.js";
import { type IExecutionResultEnvelope } from "../../../../model/index.js";
import { InsightAlerts } from "../../insight/configuration/InsightAlerts.js";
import { type IInsightMenuItem } from "../types.js";

const getPresentationExportItems = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    presentationTooltip: string,
): IInsightMenuItem[] => {
    const {
        isExportPngImageVisible,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
    } = config;

    const pngImageItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportPngImage",
        itemName: intl.formatMessage({ id: "options.menu.export.image.PNG" }),
        icon: "gd-icon-type-image",
        className: "gd-export-options-png",
        disabled: exportPngImageDisabled,
        tooltip: exportPngImageDisabled ? presentationTooltip : undefined,
        onClick: onExportPngImage,
    };

    const pdfPresentationItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportPdfPresentation",
        itemName: intl.formatMessage({ id: "options.menu.export.presentation.PDF" }),
        icon: "gd-icon-type-pdf",
        className: "gd-export-options-pdf-presentation",
        disabled: exportPdfPresentationDisabled,
        tooltip: exportPdfPresentationDisabled ? presentationTooltip : undefined,
        onClick: onExportPdfPresentation,
    };

    const pptxPresentationItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportPptxPresentation",
        itemName: intl.formatMessage({ id: "options.menu.export.presentation.PPTX" }),
        icon: "gd-icon-type-slides",
        className: "gd-export-options-pptx-presentation",
        disabled: exportPowerPointPresentationDisabled,
        tooltip: exportPowerPointPresentationDisabled ? presentationTooltip : undefined,
        onClick: onExportPowerPointPresentation,
    };

    return compact([isExportPngImageVisible && pngImageItem, pdfPresentationItem, pptxPresentationItem]);
};

const getDataExportGroupItems = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    tooltip: string,
): IInsightMenuItem[] => {
    const {
        isExportPdfTabularVisible,
        exportXLSXDisabled,
        exportCSVDisabled,
        exportCSVRawDisabled,
        exportPdfTabularDisabled,
        onExportXLSX,
        onExportCSV,
        onExportRawCSV,
        onExportPdfTabular,
    } = config;

    const xlsxItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportXLSX",
        itemName: intl.formatMessage({ id: "widget.options.menu.XLSX" }),
        icon: "gd-icon-type-sheet",
        className: "gd-export-options-xlsx",
        disabled: exportXLSXDisabled,
        tooltip: exportXLSXDisabled ? tooltip : undefined,
        onClick: onExportXLSX,
    };

    const pdfTabularItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportPDFFormatted",
        itemName: intl.formatMessage({
            id: "widget.options.menu.exportToPDF.formatted",
        }),
        icon: "gd-icon-type-pdf",
        className: "gd-export-options-pdf-data",
        disabled: exportPdfTabularDisabled,
        tooltip: exportPdfTabularDisabled ? tooltip : undefined,
        onClick: onExportPdfTabular,
    };

    const csvFormattedItem: IInsightMenuItem = {
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
    };

    const csvRawItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportCSVRaw",
        itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV.raw" }),
        icon: "gd-icon-type-csv-raw",
        className: "gd-export-options-csv-raw",
        disabled: exportCSVRawDisabled,
        tooltip: exportCSVRawDisabled ? tooltip : undefined,
        onClick: onExportRawCSV,
    };

    return compact([xlsxItem, isExportPdfTabularVisible && pdfTabularItem, csvFormattedItem, csvRawItem]);
};

const getDataExportGroup = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    tooltip: string,
): IInsightMenuItem[] => {
    const items = getDataExportGroupItems(intl, config, tooltip);

    return [
        {
            type: "group" as const,
            itemId: "ExportGroup",
            itemName: intl.formatMessage({ id: "options.menu.export.header.data" }),
            items,
        },
    ];
};

const getExportMenuItems = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    execution?: IExecutionResultEnvelope,
): IInsightMenuItem[] => {
    const { isExportVisible, isExportRawVisible, isExporting, disabledReason } = config;

    const tooltipId = getExportTooltipId({
        isRawExportsEnabled: isExportRawVisible,
        isExporting,
        execution,
        disabledReason,
    });
    const tooltip = intl.formatMessage({ id: tooltipId });
    const presentationTooltip = intl.formatMessage({
        id: "options.menu.export.presentation.unsupported.oldWidget",
    });

    // Presentation exports section - only shown if isExportVisible is true
    const presentationItems = isExportVisible
        ? getPresentationExportItems(intl, config, presentationTooltip)
        : [];

    // Data exports section - only shown if isExportRawVisible is true
    const dataExportItems = isExportRawVisible ? getDataExportGroup(intl, config, tooltip) : [];

    return [...presentationItems, ...dataExportItems];
};

/**
 * @internal
 */
export function getDefaultInsightMenuItems(
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    execution?: IExecutionResultEnvelope,
): IInsightMenuItem[] {
    const {
        exportCSVDisabled,
        exportXLSXDisabled,

        isExporting,
        scheduleExportDisabled,
        scheduleExportDisabledReason,
        scheduleExportManagementDisabled,
        isAutomationManagementEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        onAlertingManagementOpen,
        isScheduleExportVisible,
        isScheduleExportManagementVisible,
        isDataError,
        isAlertingVisible,
        isAlertManagementVisible,
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
            a: (chunk: ReactNode) => (
                <a href="/settings" rel="noopener noreferrer" target="_blank">
                    {chunk}
                </a>
            ),
        },
    );
    const exportDisabledTooltip = intl.formatMessage({
        id: "options.menu.export.in.progress",
    });

    const alertingDisabledTooltip =
        alertingDisabledReason === "oldWidget"
            ? alertingOldWidgetTooltip
            : alertingDisabledReason === "noDestinations"
              ? noDestinationsTooltip
              : alertingDisabledReason === "disabledOnInsight"
                ? alertingForInsightNotEnabledTooltip
                : undefined;

    const scheduleExportDisabledTooltip =
        scheduleExportDisabledReason === "incompatibleWidget"
            ? incompatibleWidgetTooltip
            : scheduleExportDisabledReason === "oldWidget"
              ? oldWidgetTooltip
              : scheduleExportDisabledReason === "disabledOnInsight"
                ? schedulingForInsightNotEnabledTooltip
                : undefined;

    const exportMenuItems = getExportMenuItems(intl, config, execution);

    const isSomeScheduleVisible =
        (isScheduleExportVisible && !scheduleExportDisabled) ||
        (isScheduleExportManagementVisible && !scheduleExportManagementDisabled);

    const availableMenuItems = {
        exportsSubmenu: {
            type: "submenu" as const,
            itemId: "Exports",
            itemName: intl.formatMessage({ id: "widget.options.menu.export" }),
            icon: "gd-icon-download",
            className: "s-options-menu-exports",
            disabled: isExporting,
            tooltip: exportDisabledTooltip,
            items: exportMenuItems,
        },
        exportXLSXBubble: {
            type: "button" as const,
            itemId: "ExportXLSXBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToXLSX" }),
            onClick: onExportXLSX,
            disabled: exportXLSXDisabled,
            tooltip: defaultWidgetTooltip,
            icon: "gd-icon-download",
            className: "s-options-menu-export-xlsx",
        },
        exportCSVBubble: {
            type: "button" as const,
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV" }),
            onClick: onExportCSV,
            disabled: exportCSVDisabled,
            tooltip: defaultWidgetTooltip,
            icon: "gd-icon-download",
            className: "s-options-menu-export-csv",
        },
        alertingSeparator: {
            itemId: "AlertingSeparator",
            type: "separator" as const,
        },
        alertsSubmenu: {
            type: "submenu" as const,
            itemId: "Alerts",
            itemName: intl.formatMessage({ id: "widget.options.menu.alerts" }),
            icon: "gd-icon-bell",
            className: "s-options-menu-alerting",
            SubmenuComponent: InsightAlerts,
            renderSubmenuComponentOnly: true,
            tooltip: alertingDisabledTooltip,
            disabled: alertingDisabled,
        },
        alertsManagement: {
            type: "button" as const,
            itemId: "AlertsManagement",
            itemName: intl.formatMessage({ id: "widget.options.menu.alert" }),
            onClick: onAlertingManagementOpen,
            disabled: alertingDisabled,
            tooltip: alertingDisabledTooltip,
            icon: "gd-icon-bell",
            className: "s-options-menu-alerting-management",
        },
        schedulingSeparator: {
            itemId: "SchedulingSeparator",
            type: "separator" as const,
        },
        scheduleExport: {
            type: "button" as const,
            itemId: "ScheduleExport",
            itemName: intl.formatMessage({ id: "widget.options.menu.scheduleExport" }),
            onClick: onScheduleExport,
            disabled: scheduleExportDisabled,
            tooltip: scheduleExportDisabledTooltip,
            icon: "gd-icon-clock",
            className: "s-options-menu-schedule-export",
        },
        scheduleExportEdit: {
            type: "button" as const,
            itemId: "ScheduleExportEdit",
            itemName: canCreateAutomation
                ? intl.formatMessage({ id: "widget.options.menu.scheduleExport.edit" })
                : intl.formatMessage({ id: "options.menu.schedule.email.edit.noCreatePermissions" }),
            onClick: onScheduleManagementExport,
            disabled: scheduleExportManagementDisabled,
            tooltip: defaultWidgetTooltip,
            icon: canCreateAutomation ? (
                <span className="gd-ui-icon-wrapper">
                    <UiIcon type="list" size={16} color="complementary-5" />
                </span>
            ) : (
                "gd-icon-clock"
            ),
            className: "s-options-menu-schedule-export-edit",
        },
        scheduleExportManagement: {
            type: "button" as const,
            itemId: "ScheduleExportManagement",
            itemName: intl.formatMessage({ id: "widget.options.menu.scheduleExport" }),
            onClick: onScheduleManagementExport,
            disabled: scheduleExportDisabled,
            tooltip: scheduleExportDisabledTooltip,
            icon: "gd-icon-clock",
            className: "s-options-menu-schedule-export",
        },
    };

    const menuItems: (false | IInsightMenuItem)[] = isAutomationManagementEnabled
        ? [
              (isExportRawVisible || isExportVisible) && availableMenuItems.exportsSubmenu,
              !isExportRawVisible && availableMenuItems.exportXLSXBubble,
              !isExportRawVisible && availableMenuItems.exportCSVBubble,
              isScheduleExportManagementVisible && availableMenuItems.scheduleExportManagement,
              isAlertManagementVisible && availableMenuItems.alertsManagement,
          ]
        : [
              (isExportRawVisible || isExportVisible) && availableMenuItems.exportsSubmenu,
              !isExportRawVisible && availableMenuItems.exportXLSXBubble,
              !isExportRawVisible && availableMenuItems.exportCSVBubble,
              isAlertingVisible && availableMenuItems.alertingSeparator,
              isAlertingVisible && availableMenuItems.alertsSubmenu,
              isSomeScheduleVisible && availableMenuItems.schedulingSeparator,
              isScheduleExportVisible && availableMenuItems.scheduleExport,
              isScheduleExportManagementVisible && availableMenuItems.scheduleExportEdit,
          ];

    return compact(menuItems);
}
