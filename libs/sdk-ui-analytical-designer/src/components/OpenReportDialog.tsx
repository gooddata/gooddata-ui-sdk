// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { ConfirmDialog as ConfirmDialogComponent } from "@gooddata/sdk-ui-kit";

import { hideDialog } from "../actions/dialogs_actions.js";
import { openReport } from "../actions/open_actions.js";
import { openReportDialogSelector } from "../selectors/dialogs_selector.js";
import { type AppDispatch } from "../store/types.js";

interface IOpenReportDialogProps {
    /** test seam: defaults to the ui-kit dialog */
    ConfirmDialog?: typeof ConfirmDialogComponent;
}

export function OpenReportDialog({ ConfirmDialog = ConfirmDialogComponent }: IOpenReportDialogProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const { openReportDialog } = useSelector(openReportDialogSelector);
    const insightRef = openReportDialog.data;

    const onHideDialog = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    // insightRef is always set while the dialog is active; the guard only keeps the null out of the action.
    const onOpenReportDialogConfirm = useCallback(() => {
        if (insightRef) {
            dispatch(openReport(insightRef, true));
        }
    }, [dispatch, insightRef]);

    if (openReportDialog.active) {
        return (
            <ConfirmDialog
                onCancel={onHideDialog}
                onSubmit={onOpenReportDialogConfirm}
                className="s-dialog"
                headline={intl.formatMessage({ id: "dialogs.openReportConfirmation.headline" })}
                cancelButtonText={intl.formatMessage({ id: "dialogs.openReportConfirmation.cancel" })}
                submitButtonText={intl.formatMessage({ id: "dialogs.openReportConfirmation.confirm" })}
            >
                <p>{intl.formatMessage({ id: "dialogs.openReportConfirmation.description" })}</p>
            </ConfirmDialog>
        );
    }

    return false;
}
