// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getDialogsState } from "../store/dialogs/dialogs_selectors.js";

import { getProjectId } from "./bootstrap_selector.js";
import { getIsEmbedded } from "./meta_selector.js";
import { analyticalDashboardUriFactorySelector } from "./uri_selector.js";

const getOpenReportDialog = createSelector(getDialogsState, (dialogs) => dialogs.openReportConfirmation);

const getDeleteReportDialog = createSelector(getDialogsState, (dialogs) => dialogs.deleteReportConfirmation);
const getSavingUntitledReportDialog = createSelector(
    getDialogsState,
    (dialogs) => dialogs.savingUntitledReport,
);

const getOpenAttributeHierarchyEditDialog = createSelector(
    getDialogsState,
    (dialogs) => dialogs.openAttributeHierarchyEditDialog.active,
);

const getAttributeHierarchyEditDialogData = createSelector(
    getDialogsState,
    (dialogs) => dialogs.openAttributeHierarchyEditDialog.data,
);

export const deleteReportDialogSelector = createSelector(
    getDeleteReportDialog,
    getProjectId,
    getIsEmbedded,
    analyticalDashboardUriFactorySelector,
    (deleteReportDialog, projectId, isEmbedded, analyticalDashboardUriFactory) => ({
        deleteReportDialog,
        projectId,
        isEmbedded,
        analyticalDashboardUriFactory,
    }),
);

export const saveReportDialogSelector = createSelector(
    getSavingUntitledReportDialog,
    (savingUntitledReportDialog) => ({
        savingUntitledReportDialog,
    }),
);

export const openReportDialogSelector = createSelector(getOpenReportDialog, (openReportDialog) => ({
    openReportDialog,
}));

export const attributeHierarchyEditDialogSelector = createSelector(
    getOpenAttributeHierarchyEditDialog,
    getAttributeHierarchyEditDialogData,
    (openAttributeHierarchyEditDialog, attributeHierarchy) => ({
        openAttributeHierarchyEditDialog,
        attributeHierarchy,
    }),
);

export const exportPdfDialogSelector = createSelector(getDialogsState, (dialogs) => ({
    isOpen: dialogs.exportPdf?.active ?? false,
}));

export const exportCsvDialogSelector = createSelector(getDialogsState, (dialogs) => ({
    isOpen: dialogs.exportCsv.active,
    mode: dialogs.exportCsv.mode,
}));
