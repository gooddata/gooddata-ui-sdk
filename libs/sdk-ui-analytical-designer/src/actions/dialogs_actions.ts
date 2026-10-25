// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

import { ActionTypeKeys } from "../constants/actions.js";

export const hideDialog = createAction(ActionTypeKeys.DIALOG_HIDE);

export const hideConfirmUnsavedChangesDialog = createAction(
    ActionTypeKeys.CONFIRM_UNSAVED_CHANGES_DIALOG_HIDE,
);

export const hideSaveReportDialog = createAction(ActionTypeKeys.SAVE_REPORT_DIALOG_HIDE);

/**
 * Opens the "name your insight before saving" confirmation dialog.
 *
 * @param data.saveAsNew - the confirmed save continues as save-as-new
 * @param data.reOpenEmbedDialog - re-open the embed-insight dialog after the save flow ends
 */
export const showDialogSavingUntitledReport = createAction(
    ActionTypeKeys.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION,
    (data: { saveAsNew?: boolean; reOpenEmbedDialog?: boolean }) => ({ payload: data }),
);

export const showAttributeHierarchyEditDialog = createAction(
    ActionTypeKeys.STORE_SHOW_ATTRIBUTE_HIERARCHY_EDIT_DIALOG,
    (attributeHierarchy: ICatalogAttributeHierarchy) => ({ payload: { attributeHierarchy } }),
);
