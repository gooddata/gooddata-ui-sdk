// (C) 2020-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IConfirmUnsavedChangesDialogActionPayloadData } from "../actions/confirm_unsaved_changes_actions.js";
import { getDialogsState } from "../store/dialogs/dialogs_selectors.js";
import { hasMetricEditorUnsavedChanges } from "../store/metric_editor/metric_editor_selector.js";

import { canSaveReport } from "./editor_header_selector.js";
import {
    isComputingShortcutSelector,
    isExecutionRunningSelector,
    isReportSavedSelector,
} from "./report_selector.js";
import { hasUnsavedChangesSelector, isSaveDisabledSelector } from "./save_report_selector.js";

export const getConfirmUnsavedChangesDialogStatus = createSelector(
    getDialogsState,
    (dialogs) => dialogs.confirmUnsavedChanges.active,
);

const getConfirmUnsavedChangesDialogData = createSelector(
    getDialogsState,
    (dialogs) => dialogs.confirmUnsavedChanges.data,
);

// A running execution alone is no change: the first execution of an opened visualization runs too.
export const isReportChanging = createSelector(
    isSaveDisabledSelector,
    isComputingShortcutSelector,
    isExecutionRunningSelector,
    hasUnsavedChangesSelector,
    (isSaveDisabled: boolean, isComputing: boolean, isExecuting: boolean, hasUnsavedChanges: boolean) =>
        !isSaveDisabled || isComputing || (isExecuting && hasUnsavedChanges),
);

export const confirmUnsavedChangesDialogSelector = createSelector(
    getConfirmUnsavedChangesDialogStatus,
    getConfirmUnsavedChangesDialogData,
    isReportSavedSelector,
    isSaveDisabledSelector,
    canSaveReport,
    hasMetricEditorUnsavedChanges,
    (
        visible: boolean,
        data: IConfirmUnsavedChangesDialogActionPayloadData,
        isSavedReport,
        isSaveDisabled,
        canSaveReport,
        isMetricEditorUnsaved,
    ) => ({
        visible,
        data,
        isSavedReport,
        isSaveDisabled,
        canSaveReport,
        isMetricEditorUnsaved,
    }),
);
