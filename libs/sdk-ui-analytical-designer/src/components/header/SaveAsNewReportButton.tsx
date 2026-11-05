// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { saveReportCheck } from "../../actions/save_actions.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerSaveAsProps,
} from "../../embedding/editorHeaderSlotTypes.js";
import { isSaveAsNewDisabledSelector, isSavingAsNewSelector } from "../../selectors/save_report_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";

const messages = defineMessages({
    saveAsNew: { id: "save_as_new" },
    saving: { id: "saving" },
});

const canSaveAs = (state: IAppState) => !isSaveAsNewDisabledSelector(state);
const runSaveAs = (dispatch: AppDispatch) => dispatch(saveReportCheck(true));

export function useSaveAsProps(context: IAnalyticalDesignerHeaderContext): IAnalyticalDesignerSaveAsProps {
    const intl = useIntl();
    const isSaving = useSelector(isSavingAsNewSelector);
    const isDisabled = useSelector(isSaveAsNewDisabledSelector);
    const onSaveAs = useGuardedCallback(canSaveAs, runSaveAs);
    const label = intl.formatMessage(isSaving ? messages.saving : messages.saveAsNew);

    return useMemo(
        () => ({ ...context, label, isDisabled, isSaving, onSaveAs }),
        [context, label, isDisabled, isSaving, onSaveAs],
    );
}

/**
 * Default of the SaveAs slot.
 */
export function DefaultSaveAs({ label, isDisabled, onSaveAs }: IAnalyticalDesignerSaveAsProps) {
    return (
        <Button
            className="s-save-as-new-button save-as-new-button gd-button-secondary editor-header-item"
            onClick={onSaveAs}
            value={label}
            disabled={isDisabled}
        />
    );
}
