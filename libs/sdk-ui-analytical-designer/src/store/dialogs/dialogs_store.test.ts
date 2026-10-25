// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { deleteReportConfirmation } from "../../actions/delete_actions.js";
import {
    hideConfirmUnsavedChangesDialog,
    hideDialog,
    hideSaveReportDialog,
    showAttributeHierarchyEditDialog,
    showDialogSavingUntitledReport,
} from "../../actions/dialogs_actions.js";
import { openReportConfirmation } from "../../actions/open_actions.js";
import { saveReportFromKD } from "../../actions/save_actions.js";
import { ActionTypeKeys } from "../../constants/actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { type IAppState } from "../types.js";

import { type IDialogsState, dialogsInitialState } from "./dialogs_state.js";

const dummyInsightUriRef = uriRef("/gd/dummy/report/uri");
const dummyInsightMeta = { title: "My test insight" };

// The tests drive the LIFTED reducer with a whole root state, the way the slice runs in the root
// chain (see store/highlighting/test).
const dialogsOf = (state: IAppState): IDialogsState => state.appState.dialogs;
const reduce = (state: IAppState, action: UnknownAction): IDialogsState =>
    dialogsOf(combinedRootReducer(state, action));

describe("dialogs store", () => {
    function setTestDialog(state: IAppState) {
        return combinedRootReducer(state, openReportConfirmation(dummyInsightUriRef));
    }

    it("should self-initialize the subtree from the slice initial state", () => {
        const updated = combinedRootReducer(initialState, { type: "@@ANY" });

        expect(dialogsOf(updated)).toEqual(dialogsInitialState);
    });

    describe(`#${ActionTypeKeys.DIALOG_HIDE}`, () => {
        it("should set dialog active flag to false and remove dialog data", () => {
            const stateWithDialog = setTestDialog(initialState);

            const dialogs = reduce(stateWithDialog, hideDialog());

            expect(dialogs.openReportConfirmation).toEqual({ active: false, data: null });
        });
    });

    describe(`#${ActionTypeKeys.OPEN_REPORT_STARTED}`, () => {
        it("should hide all dialogs", () => {
            const stateWithDialog = setTestDialog(initialState);

            const dialogs = reduce(stateWithDialog, { type: ActionTypeKeys.OPEN_REPORT_STARTED });

            expect(dialogs.openReportConfirmation).toEqual({ active: false, data: null });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_OPEN_REPORT_CONFIRMATION}`, () => {
        it("should set flags to show open report confirmation dialog", () => {
            const dialogs = reduce(initialState, openReportConfirmation(dummyInsightUriRef));

            expect(dialogs.openReportConfirmation).toEqual({ active: true, data: dummyInsightUriRef });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_EXPORT_REPORT}`, () => {
        it("should set flags to show export report dialog", () => {
            const dialogs = reduce(initialState, { type: ActionTypeKeys.SHOW_DIALOG_EXPORT_REPORT });

            expect(dialogs.exportReport).toEqual({ active: true });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_EXPORT_PDF}`, () => {
        it("should set flags to show export pdf dialog", () => {
            const dialogs = reduce(initialState, { type: ActionTypeKeys.SHOW_DIALOG_EXPORT_PDF });

            expect(dialogs.exportPdf).toEqual({ active: true });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_EXPORT_CSV}`, () => {
        it("should set flags and mode to show export csv dialog", () => {
            const dialogs = reduce(initialState, {
                type: ActionTypeKeys.SHOW_DIALOG_EXPORT_CSV,
                payload: { mode: "raw" },
            });

            expect(dialogs.exportCsv).toEqual({ active: true, mode: "raw" });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_SAVING_UNTITLED_REPORT_CONFIRMATION}`, () => {
        it("should not have saving untitled report confirmation flag set by default", () => {
            const dialogs = reduce(initialState, { type: "@@ANY" });

            expect(dialogs.savingUntitledReport.active).toBe(false);
        });

        it("should set flags to show saving untitled report confirmation", () => {
            const dialogs = reduce(
                initialState,
                showDialogSavingUntitledReport({ saveAsNew: true, reOpenEmbedDialog: false }),
            );

            expect(dialogs.savingUntitledReport).toEqual({
                active: true,
                data: { saveAsNew: true, reOpenEmbedDialog: false },
            });
        });
    });

    describe(`#${ActionTypeKeys.SAVE_REPORT_DIALOG_HIDE}`, () => {
        it("should hide only the saving untitled report confirmation", () => {
            let state = combinedRootReducer(
                initialState,
                showDialogSavingUntitledReport({ saveAsNew: true }),
            );
            state = combinedRootReducer(state, { type: ActionTypeKeys.SHOW_DIALOG_EXPORT_REPORT });

            const dialogs = reduce(state, hideSaveReportDialog());

            expect(dialogs.savingUntitledReport).toEqual({ active: false });
            expect(dialogs.exportReport).toEqual({ active: true });
        });
    });

    describe(`#${ActionTypeKeys.STORE_SHOW_CONFIRM_UNSAVED_CHANGES_DIALOG}`, () => {
        it("should store the confirmation dialog state and data", () => {
            const data = { firePostMessage: true };
            const dialogs = reduce(initialState, {
                type: ActionTypeKeys.STORE_SHOW_CONFIRM_UNSAVED_CHANGES_DIALOG,
                payload: { active: true, data },
            });

            expect(dialogs.confirmUnsavedChanges).toEqual({ active: true, data });
        });
    });

    describe(`#${ActionTypeKeys.CONFIRM_UNSAVED_CHANGES_DIALOG_HIDE}`, () => {
        it("should hide only the confirm unsaved changes dialog", () => {
            let state = combinedRootReducer(initialState, {
                type: ActionTypeKeys.STORE_SHOW_CONFIRM_UNSAVED_CHANGES_DIALOG,
                payload: { active: true, data: { firePostMessage: true } },
            } as { type: string });
            state = combinedRootReducer(state, { type: ActionTypeKeys.SHOW_DIALOG_EXPORT_REPORT });

            const dialogs = reduce(state, hideConfirmUnsavedChangesDialog());

            expect(dialogs.confirmUnsavedChanges).toEqual({ active: false, data: null });
            expect(dialogs.exportReport).toEqual({ active: true });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_SAVE_REPORT_FROM_KD}`, () => {
        it("should set flags to show the save report from KD dialog", () => {
            const dialogs = reduce(initialState, saveReportFromKD());

            expect(dialogs.openSaveReportFromKD).toEqual({ active: true });
        });
    });

    describe(`#${ActionTypeKeys.SHOW_DIALOG_DELETE_REPORT_CONFIRMATION}`, () => {
        it("should set flags to show delete report confirmation dialog", () => {
            const dialogs = reduce(
                initialState,
                deleteReportConfirmation(dummyInsightUriRef, dummyInsightMeta),
            );

            expect(dialogs.deleteReportConfirmation).toEqual({
                active: true,
                data: {
                    insightRef: dummyInsightUriRef,
                    meta: dummyInsightMeta,
                },
            });
        });
    });

    describe(`#${ActionTypeKeys.DELETE_REPORT_STARTED}`, () => {
        it("should close the delete confirmation dialog when the delete starts", () => {
            const shown = combinedRootReducer(
                initialState,
                deleteReportConfirmation(dummyInsightUriRef, dummyInsightMeta),
            );

            const dialogs = reduce(shown, {
                type: ActionTypeKeys.DELETE_REPORT_STARTED,
                payload: { insightRef: dummyInsightUriRef },
            });

            expect(dialogs.deleteReportConfirmation.active).toBe(false);
        });
    });

    describe(`#${ActionTypeKeys.UI_EMBED_DIALOG_OPEN}`, () => {
        it("should set flag to show the embed insight dialog", () => {
            const dialogs = reduce(initialState, { type: ActionTypeKeys.UI_EMBED_DIALOG_OPEN });

            expect(dialogs.openEmbedInsightDialog).toEqual({ active: true });
        });
    });

    describe(`#${ActionTypeKeys.STORE_SHOW_ATTRIBUTE_HIERARCHY_EDIT_DIALOG}`, () => {
        it("should store the edited attribute hierarchy and open the dialog", () => {
            const attributeHierarchy = { attributeHierarchy: { id: "hierarchy1" } } as Parameters<
                typeof showAttributeHierarchyEditDialog
            >[0];
            const dialogs = reduce(initialState, showAttributeHierarchyEditDialog(attributeHierarchy));

            expect(dialogs.openAttributeHierarchyEditDialog).toEqual({
                active: true,
                data: attributeHierarchy,
            });
        });
    });
});
