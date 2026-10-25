// (C) 2020-2026 GoodData Corporation

import { type ChangeEvent, type FocusEvent, useCallback, useEffect, useState } from "react";

import { defineMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger, ConfirmDialog, Input } from "@gooddata/sdk-ui-kit";

import { hideDialog } from "../actions/dialogs_actions.js";
import { reportTitleChange } from "../actions/report_actions.js";
import { saveReportCheck } from "../actions/save_actions.js";
import { MAX_TITLE_LENGTH } from "../constants/report.js";
import { saveReportFromKDDialogSelector } from "../selectors/save_report_from_kd_dialog_selector.js";
import { type AppDispatch } from "../store/types.js";

import { InsightUsageOnDashboardsList } from "./saveReportFromKD/InsightUsageOnDashboardsList.js";

const DIALOG_UPDATE_MODE = "update";
const DIALOG_CREATE_MODE = "create";

export function SaveReportFromKDDialog() {
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();

    const {
        insightUsedOnDashboards,
        openSaveReportFromKD,
        editingReportTitle,
        isSaveAsNewReportOnly,
        canCreateCopy,
    } = useSelector(saveReportFromKDDialogSelector);

    const onHideDialog = useCallback(() => {
        dispatch(hideDialog());
    }, [dispatch]);

    const onReportTitleChange = useCallback(
        (title: string) => {
            dispatch(reportTitleChange(title));
        },
        [dispatch],
    );

    const onReportSave = useCallback(
        (saveAsNew: boolean, editingFromKD?: boolean, reOpenEmbedDialog?: boolean) => {
            dispatch(saveReportCheck(saveAsNew, editingFromKD, reOpenEmbedDialog));
        },
        [dispatch],
    );

    const defaultReportName = intl.formatMessage(
        {
            id: "dialogs.saveReportFormKD.reportNamePlaceholder",
        },
        { name: editingReportTitle },
    );

    const getInitialState = useCallback(
        () => ({
            saveOption: isSaveAsNewReportOnly ? DIALOG_CREATE_MODE : DIALOG_UPDATE_MODE,
            newReportName: defaultReportName,
            isSubmitting: false,
        }),
        [defaultReportName, isSaveAsNewReportOnly],
    );
    const [state, setState] = useState(getInitialState());

    useEffect(() => {
        if (openSaveReportFromKD) {
            setState(getInitialState());
        }
    }, [openSaveReportFromKD, getInitialState]);

    if (!openSaveReportFromKD) {
        return null;
    }

    const isUpdateMode = () => state.saveOption === DIALOG_UPDATE_MODE;

    const isSaveAsNewMode = () => state.saveOption === DIALOG_CREATE_MODE;

    const handleSaveOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setState({
            ...state,
            saveOption: e.target.value,
        });
    };

    const handleReportNameChange = (value: string) => {
        setState({ ...state, newReportName: value });
    };

    const handleReportNameFocus = (e: FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const handleSaveReportFromKDDialogSubmit = () => {
        if (state.isSubmitting) {
            return;
        }
        const saveAsNew = isSaveAsNewMode();
        if (saveAsNew) {
            onReportTitleChange(state.newReportName || defaultReportName);
        }
        setState({ ...state, isSubmitting: true });
        onReportSave(saveAsNew, true);
        onHideDialog();
    };

    return (
        <ConfirmDialog
            isPositive
            onCancel={onHideDialog}
            onSubmit={handleSaveReportFromKDDialogSubmit}
            className="save-report-dialog s-save-report-from-kd-dialog"
            headline={intl.formatMessage({ id: "dialogs.saveReportFromKD.headline" })}
            cancelButtonText={intl.formatMessage({
                id: "dialogs.savingUntitledReportConfirmation.cancel",
            })}
            submitButtonText={intl.formatMessage(
                isUpdateMode() ? defineMessage({ id: "save" }) : defineMessage({ id: "create.copy" }),
            )}
            isSubmitDisabled={state.isSubmitting}
        >
            <div>
                <BubbleHoverTrigger>
                    <label className="input-radio-label">
                        <input
                            type="radio"
                            className="input-radio"
                            value={DIALOG_UPDATE_MODE}
                            onChange={handleSaveOptionChange}
                            checked={isUpdateMode()}
                            disabled={isSaveAsNewReportOnly}
                        />
                        <span className="input-label-text">
                            {intl.formatMessage({ id: "dialogs.saveReportFromKD.radio.saveOnAllDashboard" })}
                        </span>
                    </label>
                    {isSaveAsNewReportOnly ? (
                        <Bubble alignTo="input-radio-label" alignPoints={[{ align: "cr cl" }]}>
                            {intl.formatMessage({ id: "locked_report" })}
                        </Bubble>
                    ) : null}
                </BubbleHoverTrigger>
            </div>
            {canCreateCopy ? (
                <div>
                    <label className="input-radio-label">
                        <input
                            type="radio"
                            className="input-radio s-save-option"
                            value={DIALOG_CREATE_MODE}
                            onChange={handleSaveOptionChange}
                            checked={isSaveAsNewMode()}
                        />
                        <span className="input-label-text">
                            {intl.formatMessage({
                                id: "dialogs.saveReportFromKD.radio.createCopyOfTheInsight",
                            })}
                        </span>
                    </label>
                </div>
            ) : null}

            {state.saveOption === DIALOG_CREATE_MODE && (
                <div className="report-name-wrapper">
                    <Input
                        autofocus
                        label={intl.formatMessage({ id: "dialogs.saveReportFromKD.name" })}
                        maxlength={MAX_TITLE_LENGTH}
                        onFocus={handleReportNameFocus}
                        onChange={(value) => handleReportNameChange(String(value))}
                        placeholder={defaultReportName}
                        value={state.newReportName}
                        className="s-report-name-input"
                    />
                </div>
            )}
            {insightUsedOnDashboards && insightUsedOnDashboards.allDashboardsCount > 0 ? (
                <InsightUsageOnDashboardsList insightUsedOnDashboards={insightUsedOnDashboards} />
            ) : null}
        </ConfirmDialog>
    );
}
