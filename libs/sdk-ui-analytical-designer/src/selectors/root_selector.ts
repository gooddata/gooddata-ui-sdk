// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { getAppReadyState, getErrorsState } from "../store/app_context/app_context_selectors.js";
import { getIsEmbeddedState } from "../store/embedding/embedding_selectors.js";
import { hasMetricEditorUnsavedChanges } from "../store/metric_editor/metric_editor_selector.js";
import { type IAppState } from "../store/types.js";

import { getProjectId } from "./bootstrap_selector.js";
import {
    getConfirmUnsavedChangesDialogStatus,
    isReportChanging,
} from "./confirm_unsaved_changes_dialog_selector.js";

export const rootSelector = createSelector(
    (state: IAppState) => getErrorsState(state),
    (state: IAppState) => getAppReadyState(state),
    (state: IAppState) => getIsEmbeddedState(state),
    getProjectId,
    getConfirmUnsavedChangesDialogStatus,
    isReportChanging,
    hasMetricEditorUnsavedChanges,
    (
        errors,
        isAppReady,
        isEmbedded,
        workspace,
        isConfirmUnsavedChangesDialogVisible,
        isReportChanging,
        isMetricEditorUnsaved,
    ) => ({
        errors,
        isAppReady,
        isEmbedded,
        workspace,
        isConfirmUnsavedChangesDialogVisible,
        isReportChanging,
        isMetricEditorUnsaved,
    }),
);
