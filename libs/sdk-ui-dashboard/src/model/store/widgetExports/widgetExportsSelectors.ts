// (C) 2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector } from "../types.js";
import { selectCanExecuteRaw, selectCanExportTabular } from "../permissions/permissionsSelectors.js";
import { selectSettings } from "../config/configSelectors.js";
import {
    selectSupportsExportToCsv,
    selectSupportsExportToXlsx,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";

/**
 * @internal
 */
export const selectIsExportableToCSV: DashboardSelector<boolean> = createSelector(
    selectSupportsExportToCsv,
    selectCanExportTabular,
    selectCanExecuteRaw,
    selectSettings,
    (supportsCapabilityCsv, canExportTabular, canExecuteRaw, settings): boolean => {
        const isExportEnabled = Boolean(settings.enableKPIDashboardExport && canExportTabular);
        const isRawExportEnabled = Boolean(isExportEnabled && canExecuteRaw);
        return supportsCapabilityCsv && isRawExportEnabled;
    },
);

/**
 * @internal
 */
export const selectIsExportableToXLSX: DashboardSelector<boolean> = createSelector(
    selectSupportsExportToXlsx,
    selectCanExportTabular,
    selectSettings,
    (supportCapabilityXlsx, canExportTabular, settings): boolean => {
        const isExportEnabled = Boolean(settings.enableKPIDashboardExport && canExportTabular);
        return supportCapabilityXlsx && isExportEnabled;
    },
);
