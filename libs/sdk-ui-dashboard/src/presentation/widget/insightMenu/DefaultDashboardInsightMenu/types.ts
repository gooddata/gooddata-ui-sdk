// (C) 2025 GoodData Corporation

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
export type XLSXDisabledReason = "oldWidget";

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
    xlsxDisabledReason?: XLSXDisabledReason;
}
