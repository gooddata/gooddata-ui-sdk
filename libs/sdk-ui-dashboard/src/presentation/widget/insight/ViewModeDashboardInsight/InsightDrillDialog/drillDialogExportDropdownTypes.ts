// (C) 2026 GoodData Corporation

import { type ComponentType } from "react";

/**
 * @alpha
 */
export interface IDrillDialogExportDropdownProps {
    exportAvailable: boolean;
    exportXLSXEnabled: boolean;
    exportCSVEnabled: boolean;
    exportCSVRawEnabled: boolean;
    exportPDFEnabled: boolean;
    exportPDFVisible: boolean;
    onExportXLSX: () => void;
    onExportCSV: () => void;
    onExportCSVRaw: () => void;
    onExportPDF: () => void;
    isLoading: boolean;
    isExporting: boolean;
    isExportRawVisible: boolean;
}

/**
 * @alpha
 */
export type CustomDrillDialogExportDropdownComponent = ComponentType<IDrillDialogExportDropdownProps>;
