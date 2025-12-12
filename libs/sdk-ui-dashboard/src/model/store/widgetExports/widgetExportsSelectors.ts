// (C) 2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";

import {
    selectSupportsExportToCsv,
    selectSupportsExportToXlsx,
} from "../backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableExportToPdfTabular,
    selectEnableWidgetExportPngImage,
} from "../config/configSelectors.js";
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
export const selectIsExportableToPngImage: DashboardSelector<boolean> = createSelector(
    selectEnableWidgetExportPngImage,
    selectCanExportPdf,
    (enableWidgetExportPngImage, canExportVisual): boolean => {
        return enableWidgetExportPngImage && canExportVisual;
    },
);

/**
 * @internal
 */
export const selectIsExportableToPdfTabular: DashboardSelector<boolean> = createSelector(
    selectEnableExportToPdfTabular,
    selectCanExportTabular,
    (enableExportToPdfTabular, canExportTabular): boolean => {
        return enableExportToPdfTabular && canExportTabular;
    },
);
