// (C) 2007-2026 GoodData Corporation

import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { ConfirmDialog as ConfirmDialogComponent } from "@gooddata/sdk-ui-kit";

import {
    hideConfirmUnsavedChangesDialog,
    hideDialog,
    hideSaveReportDialog,
} from "../actions/dialogs_actions.js";
import { createEmbedDialogOpenAction } from "../actions/embed_dialog_actions.js";
import { reportTitleChange } from "../actions/report_actions.js";
import { saveReportRequested } from "../actions/save_actions.js";
import { MAX_TITLE_LENGTH } from "../constants/report.js";
import { saveReportDialogSelector } from "../selectors/dialogs_selector.js";
import { type ISavingUntitledReportState } from "../store/dialogs/dialogs_state.js";
import { type AppDispatch } from "../store/types.js";

export interface ISaveReportDialogProps {
    /** test seam: defaults to the ui-kit dialog */
    ConfirmDialog?: typeof ConfirmDialogComponent;
}

interface ISaveReportDialogContentProps {
    ConfirmDialog: typeof ConfirmDialogComponent;
    data: ISavingUntitledReportState["data"];
}

export function SaveReportDialog({ ConfirmDialog = ConfirmDialogComponent }: ISaveReportDialogProps) {
    const { savingUntitledReportDialog } = useSelector(saveReportDialogSelector);

    if (!savingUntitledReportDialog?.active) {
        return null;
    }

    // The content is mounted only while the dialog is open, so the typed title always starts empty
    // on every open - no matter how the previous open ended (submit, cancel or a hide from a saga).
    return <SaveReportDialogContent ConfirmDialog={ConfirmDialog} data={savingUntitledReportDialog.data} />;
}

function SaveReportDialogContent({ ConfirmDialog, data }: ISaveReportDialogContentProps) {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const [value, setValue] = useState("");
    const textInput = useRef<HTMLInputElement>(null);
    const isSaveAsNew = data?.saveAsNew;
    const reOpenEmbedDialog = data?.reOpenEmbedDialog;
    const title = value.trim();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (textInput?.current) {
                textInput.current.focus();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const openEmbedDialog = useCallback(() => {
        if (reOpenEmbedDialog) {
            dispatch(createEmbedDialogOpenAction());
        }
    }, [reOpenEmbedDialog, dispatch]);

    const onValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const onSubmit = () => {
        if (title === "") {
            return;
        }

        dispatch(hideDialog());
        dispatch(reportTitleChange(title));
        dispatch(saveReportRequested(isSaveAsNew ?? false, false, null, reOpenEmbedDialog));
    };

    const onCancel = () => {
        dispatch(hideSaveReportDialog());
        dispatch(hideConfirmUnsavedChangesDialog());
        openEmbedDialog();
    };

    return (
        <ConfirmDialog
            isPositive
            onCancel={onCancel}
            onSubmit={onSubmit}
            className="s-dialog"
            headline={intl.formatMessage({ id: "dialogs.savingUntitledReportConfirmation.headline" })}
            cancelButtonText={intl.formatMessage({
                id: "dialogs.savingUntitledReportConfirmation.cancel",
            })}
            submitButtonText={intl.formatMessage({
                id: "dialogs.savingUntitledReportConfirmation.confirm",
            })}
            isSubmitDisabled={!title}
        >
            <p>
                <FormattedMessage id="dialogs.savingUntitledReportConfirmation.description" />
            </p>
            <input
                type="text"
                ref={textInput}
                value={value}
                onChange={onValueChange}
                maxLength={MAX_TITLE_LENGTH}
                placeholder={intl.formatMessage({
                    id: "dialogs.savingUntitledReportConfirmation.placeholder",
                })}
                className="input-text name-insight-dialog-input s-name-insight-dialog-input"
            ></input>
        </ConfirmDialog>
    );
}
