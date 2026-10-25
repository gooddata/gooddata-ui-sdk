// (C) 2020-2026 GoodData Corporation

import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { createLeaveAnywayButtonClickedAction } from "../actions/confirm_unsaved_changes_actions.js";
import { hideConfirmUnsavedChangesDialog } from "../actions/dialogs_actions.js";
import { saveReportCheck } from "../actions/save_actions.js";
import { confirmUnsavedChangesDialogSelector } from "../selectors/confirm_unsaved_changes_dialog_selector.js";
import { type AppDispatch } from "../store/types.js";

export function ConfirmUnsavedChangesDialog() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const { visible, data, isSaveDisabled, canSaveReport, isMetricEditorUnsaved } = useSelector(
        confirmUnsavedChangesDialogSelector,
    );

    if (!visible) {
        return null;
    }

    const onCancel = () => {
        dispatch(createLeaveAnywayButtonClickedAction(data));
    };

    const saveReport = () => {
        if (canSaveReport) {
            dispatch(saveReportCheck(false));
        } else {
            dispatch(saveReportCheck(true));
        }
    };

    const onSave = () => {
        if (!isSaveDisabled) {
            saveReport();
        }
        if (isMetricEditorUnsaved && (!canSaveReport || isSaveDisabled)) {
            dispatch(hideConfirmUnsavedChangesDialog());
        }
    };

    const isSubmitEnabled = () => {
        return isMetricEditorUnsaved || !isSaveDisabled;
    };

    const onClose = () => {
        dispatch(hideConfirmUnsavedChangesDialog());
    };

    const submitButtonTextId = canSaveReport
        ? defineMessage({ id: "save" }).id
        : defineMessage({ id: "save_as_new" }).id;

    return (
        <ConfirmDialog
            onCancel={onCancel}
            onClose={onClose}
            onSubmit={onSave}
            // Escape must dismiss, not cancel: onCancel discards the unsaved work.
            shouldCloseOnEscape
            isPositive
            className="s-dialog s-unsave-change-confirmation-dialog unsave-change-confirmation-dialog"
            headline={intl.formatMessage({ id: "adAlertDialog.unsaved.changes.headline" })}
            cancelButtonText={intl.formatMessage({ id: "adAlertDialog.unsaved.changes.leave.anyway" })}
            submitButtonText={intl.formatMessage({ id: submitButtonTextId })}
            isSubmitDisabled={!isSubmitEnabled()}
        >
            <p>{intl.formatMessage({ id: "adAlertDialog.unsaved.changes.message" })}</p>
        </ConfirmDialog>
    );
}
