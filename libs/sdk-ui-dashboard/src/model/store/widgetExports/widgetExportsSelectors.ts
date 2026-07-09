// (C) 2025-2026 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import {
    selectSupportsExportToCsv,
    selectSupportsExportToXlsx,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectCanExecuteRaw,
    selectCanExportPdf,
    selectCanExportTabular,
} from "../permissions/permissionsSelectors.js";
import { type DashboardSelector } from "../types.js";

/**
 * @internal
 */
export const selectIsExportableToCSV: DashboardSelector<boolean> = createSelector(
    selectSupportsExportToCsv,
    selectCanExportTabular,
    selectCanExecuteRaw,
    (supportsCapabilityCsv, canExportTabular, canExecuteRaw): boolean => {
        return supportsCapabilityCsv && canExportTabular && canExecuteRaw;
    },
);

/**
 * @internal
 */
export const selectIsExportableToXLSX: DashboardSelector<boolean> = createSelector(
    selectSupportsExportToXlsx,
    selectCanExportTabular,
    (supportCapabilityXlsx, canExportTabular): boolean => {
        return supportCapabilityXlsx && canExportTabular;
    },
);

/**
 * @internal
 */
export const selectIsExportableToPngImage: DashboardSelector<boolean> = selectCanExportPdf;
