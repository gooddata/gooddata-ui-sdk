// (C) 2007-2026 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { type Reducer } from "redux";

import { showConfirmUnsageChangesDialogAction } from "../../actions/confirm_unsaved_changes_actions.js";
import { deleteReportConfirmation, deleteReportStarted } from "../../actions/delete_actions.js";
import {
    hideConfirmUnsavedChangesDialog,
    hideDialog,
    hideSaveReportDialog,
    showAttributeHierarchyEditDialog,
    showDialogSavingUntitledReport,
} from "../../actions/dialogs_actions.js";
import { createEmbedDialogOpenAction } from "../../actions/embed_dialog_actions.js";
import {
    showDialogExportCsv,
    showDialogExportPdf,
    showDialogExportReport,
} from "../../actions/export_report_actions.js";
import { openReportConfirmation, openReportStarted } from "../../actions/open_actions.js";
import { saveReportFromKD } from "../../actions/save_actions.js";

import { type IDialogsState, dialogsInitialState } from "./dialogs_state.js";

const dialogsSlice = createSlice({
    name: "dialogs",
    initialState: dialogsInitialState,
    // (those get RTK's `${name}/${key}` type strings). Every case is wired by its CREATOR,
    // including the ones owned by other domains (open/delete/export/save) —
    // converted the last hand-written creators, so the payload type comes from the creator and
    // so the cases need no manual action annotations.
    reducers: {},
    extraReducers: (builder) => {
        builder
            // hide-everything resets: OPEN_REPORT_STARTED shares the behavior
            .addCase(hideDialog, () => dialogsInitialState)
            .addCase(openReportStarted, () => dialogsInitialState)
            .addCase(hideConfirmUnsavedChangesDialog, (state) => {
                state.confirmUnsavedChanges = dialogsInitialState.confirmUnsavedChanges;
            })
            .addCase(hideSaveReportDialog, (state) => {
                state.savingUntitledReport = dialogsInitialState.savingUntitledReport;
            })
            .addCase(openReportConfirmation, (state, action) => {
                state.openReportConfirmation = { active: true, data: action.payload.insightRef };
            })
            .addCase(showDialogSavingUntitledReport, (state, action) => {
                state.savingUntitledReport = { active: true, data: action.payload };
            })
            .addCase(deleteReportConfirmation, (state, action) => {
                state.deleteReportConfirmation = { active: true, data: action.payload };
            })
            // A cross-domain write into the
            // dialogs subtree): starting the delete closes the confirmation dialog.
            .addCase(deleteReportStarted, (state) => {
                state.deleteReportConfirmation.active = false;
            })
            .addCase(showDialogExportReport, (state) => {
                state.exportReport.active = true;
            })
            .addCase(showDialogExportPdf, (state) => {
                state.exportPdf = { active: true };
            })
            .addCase(showDialogExportCsv, (state, action) => {
                state.exportCsv = { active: true, mode: action.payload.mode };
            })
            .addCase(saveReportFromKD, (state) => {
                state.openSaveReportFromKD.active = true;
            })
            .addCase(showConfirmUnsageChangesDialogAction, (state, action) => {
                state.confirmUnsavedChanges = {
                    active: action.payload.active,
                    data: action.payload.data,
                };
            })
            .addCase(createEmbedDialogOpenAction, (state) => {
                state.openEmbedInsightDialog.active = true;
            })
            .addCase(showAttributeHierarchyEditDialog, (state, action) => {
                state.openAttributeHierarchyEditDialog = {
                    active: true,
                    data: action.payload.attributeHierarchy,
                };
            });
    },
});

export const dialogsSliceReducer: Reducer<IDialogsState> = dialogsSlice.reducer;
