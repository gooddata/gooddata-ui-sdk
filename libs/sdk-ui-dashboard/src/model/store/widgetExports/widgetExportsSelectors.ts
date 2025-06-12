// (C) 2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { DashboardSelector } from "../types.js";
import {
    selectCanExecuteRaw,
    selectCanExportPdf,
    selectCanExportTabular,
} from "../permissions/permissionsSelectors.js";
import { selectEnableWidgetExportPngImage } from "../config/configSelectors.js";
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
