// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { saveReportCheck, saveReportFromKD } from "../../actions/save_actions.js";
import {
    type IAnalyticalDesignerHeaderContext,
    type IAnalyticalDesignerSaveProps,
} from "../../embedding/editorHeaderSlotTypes.js";
import { saveReportSelector } from "../../selectors/save_report_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";

const BUBBLE_ALIGN_POINTS = [{ align: "bc tr", offset: { x: 0, y: 10 } }];

const messages = defineMessages({
    save: { id: "save" },
    saving: { id: "saving" },
});

const canSave = (state: IAppState) => !saveReportSelector(state).isDisabled;
const runSave = (dispatch: AppDispatch, state: IAppState) => {
    if (saveReportSelector(state).displaySaveInsightFromKDDialog) {
        dispatch(saveReportFromKD());
    } else {
        dispatch(saveReportCheck(false));
    }
};

export function useSaveProps(context: IAnalyticalDesignerHeaderContext): IAnalyticalDesignerSaveProps {
    const intl = useIntl();
    const isSaving = useSelector((state: IAppState) => saveReportSelector(state).isSaving);
    const isDisabled = useSelector((state: IAppState) => saveReportSelector(state).isDisabled);
    const showDisabledTooltip = useSelector(
        (state: IAppState) => saveReportSelector(state).showDisabledTooltip,
    );
    const onSave = useGuardedCallback(canSave, runSave);
    const label = intl.formatMessage(isSaving ? messages.saving : messages.save);
    const disabledTooltip = showDisabledTooltip
        ? intl.formatMessage({ id: "save.disabledTooltip.executionTimestamp" })
        : undefined;

    return useMemo(
        () => ({
            ...context,
            label,
            isDisabled,
            isSaving,
            ...(disabledTooltip ? { disabledTooltip } : {}),
            onSave,
        }),
        [context, label, isDisabled, isSaving, disabledTooltip, onSave],
    );
}

/**
 * Default of the Save slot.
 */
export function DefaultSave({ label, isDisabled, disabledTooltip, onSave }: IAnalyticalDesignerSaveProps) {
    const saveButton = (
        <Button
            className="s-save-button save-button gd-button-action editor-header-item"
            onClick={onSave}
            value={label}
            disabled={isDisabled}
        />
    );

    if (!disabledTooltip) {
        return saveButton;
    }

    return (
        <BubbleHoverTrigger>
            {saveButton}
            <Bubble className="bubble-primary" alignPoints={BUBBLE_ALIGN_POINTS}>
                {disabledTooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
