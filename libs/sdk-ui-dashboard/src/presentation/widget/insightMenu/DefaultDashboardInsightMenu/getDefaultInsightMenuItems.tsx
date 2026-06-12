// (C) 2021-2026 GoodData Corporation

import { type ReactNode } from "react";

import { compact } from "lodash-es";
import { type IntlShape } from "react-intl";

import { UiIcon } from "@gooddata/sdk-ui-kit";

import { type IExecutionResultEnvelope } from "../../../../model/store/executionResults/types.js";
import { InsightAlerts } from "../../insight/configuration/InsightAlerts.js";
import { type IInsightMenuItem } from "../types.js";

import { getExportTooltipId } from "./getExportTooltips.js";
import { type IUseInsightMenuConfig } from "./types.js";

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

/**
 * Computes the disabled state and tooltip for a formatted export entry (XLSX, formatted CSV, formatted PDF).
 *
 * @remarks
 * Shared by both the export submenu items and the XLSX/CSV quick-export bubbles so they behave consistently:
 * - While an export is in progress, the entry is disabled with the in-progress reason tooltip (this takes
 *   priority over the limit-break message - the user just needs to wait for the running export to finish).
 * - When the execution reached a result limit, the entry is disabled with the limit-break tooltip.
 * - Otherwise it reflects its own disabled flag and, when disabled, the shared disabled-reason tooltip
 *   (too large / data error / old widget / loading) derived from {@link getExportTooltipId}.
 */
function getFormattedExportItemState(
    isDisabled: boolean,
    disabledReasonTooltip: string,
    limitBreakTooltip: string | undefined,
    isExporting: boolean,
): { disabled: boolean; tooltip: string | undefined } {
    // An in-progress export takes priority - disabledReasonTooltip already resolves to the in-progress message.
    if (isExporting) {
        return { disabled: true, tooltip: disabledReasonTooltip };
    }
    if (limitBreakTooltip !== undefined) {
        return { disabled: true, tooltip: limitBreakTooltip };
    }
    return { disabled: isDisabled, tooltip: isDisabled ? disabledReasonTooltip : undefined };
}

const getDataExportGroupItems = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    disabledReasonTooltip: string,
    limitBreakTooltip: string | undefined,
): IInsightMenuItem[] => {
    const {
        isExportPdfTabularVisible,
        exportXLSXDisabled,
        exportCSVDisabled,
        exportCSVRawDisabled,
        exportPdfTabularDisabled,
        isExporting,
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
        ...getFormattedExportItemState(
            exportXLSXDisabled,
            disabledReasonTooltip,
            limitBreakTooltip,
            isExporting,
        ),
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
        ...getFormattedExportItemState(
            exportPdfTabularDisabled,
            disabledReasonTooltip,
            limitBreakTooltip,
            isExporting,
        ),
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
        ...getFormattedExportItemState(
            exportCSVDisabled,
            disabledReasonTooltip,
            limitBreakTooltip,
            isExporting,
        ),
        onClick: onExportCSV,
    };

    // Raw CSV runs a separate full execution, so it is not affected by the limit break.
    const csvRawItem: IInsightMenuItem = {
        type: "button" as const,
        itemId: "ExportCSVRaw",
        itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV.raw" }),
        icon: "gd-icon-type-csv-raw",
        className: "gd-export-options-csv-raw",
        disabled: exportCSVRawDisabled,
        tooltip: exportCSVRawDisabled ? disabledReasonTooltip : undefined,
        onClick: onExportRawCSV,
    };

    return compact([xlsxItem, isExportPdfTabularVisible && pdfTabularItem, csvFormattedItem, csvRawItem]);
};

const getDataExportGroup = (
    intl: IntlShape,
    config: IUseInsightMenuConfig,
    disabledReasonTooltip: string,
    limitBreakTooltip: string | undefined,
): IInsightMenuItem[] => {
    const items = getDataExportGroupItems(intl, config, disabledReasonTooltip, limitBreakTooltip);

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
    disabledReasonTooltip: string,
    limitBreakTooltip: string | undefined,
): IInsightMenuItem[] => {
    const { isExportVisible, isExportRawVisible } = config;

    const presentationTooltip = intl.formatMessage({
        id: "options.menu.export.presentation.unsupported.oldWidget",
    });

    // Presentation exports section - only shown if isExportVisible is true
    const presentationItems = isExportVisible
        ? getPresentationExportItems(intl, config, presentationTooltip)
        : [];

    // Data exports section - only shown if isExportRawVisible is true
    const dataExportItems = isExportRawVisible
        ? getDataExportGroup(intl, config, disabledReasonTooltip, limitBreakTooltip)
        : [];

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
        disabledReason,
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

    // Disabled-reason tooltip shared by all formatted export entries (submenu items + quick-export bubbles):
    // export in progress / too large / data error / old widget / loading.
    const exportReasonTooltip = intl.formatMessage({
        id: getExportTooltipId({
            isRawExportsEnabled: isExportRawVisible,
            isExporting,
            execution,
            disabledReason,
        }),
    });

    // When the execution reached a result limit, formatted exports (XLSX, formatted CSV/PDF, and the XLSX/CSV
    // quick-export bubbles) can only contain partial data, so they are disabled with an explanatory tooltip.
    // Raw CSV is unaffected (it runs a separate full execution).
    const hasLimitBreaks = (execution?.limitBreaks?.length ?? 0) > 0;
    const limitBreakTooltip = hasLimitBreaks
        ? intl.formatMessage({ id: "options.menu.export.partialResults.exportDisabled" })
        : undefined;

    const exportMenuItems = getExportMenuItems(intl, config, exportReasonTooltip, limitBreakTooltip);

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
            ...getFormattedExportItemState(
                exportXLSXDisabled,
                exportReasonTooltip,
                limitBreakTooltip,
                isExporting,
            ),
            icon: "gd-icon-download",
            className: "s-options-menu-export-xlsx",
        },
        exportCSVBubble: {
            type: "button" as const,
            itemId: "ExportCSVBubble",
            itemName: intl.formatMessage({ id: "widget.options.menu.exportToCSV" }),
            onClick: onExportCSV,
            ...getFormattedExportItemState(
                exportCSVDisabled,
                exportReasonTooltip,
                limitBreakTooltip,
                isExporting,
            ),
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
