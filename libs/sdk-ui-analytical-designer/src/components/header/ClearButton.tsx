// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { resetApplication } from "../../actions/app_context_actions.js";
import {
    type IAnalyticalDesignerClearProps,
    type IAnalyticalDesignerHeaderContext,
} from "../../embedding/editorHeaderSlotTypes.js";
import { isEditorHeaderResetDisabled } from "../../selectors/editor_header_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";

const canClear = (state: IAppState) => !isEditorHeaderResetDisabled(state);
const runClear = (dispatch: AppDispatch) => dispatch(resetApplication());

export function useClearProps(context: IAnalyticalDesignerHeaderContext): IAnalyticalDesignerClearProps {
    const intl = useIntl();
    const isDisabled = useSelector(isEditorHeaderResetDisabled);
    const onClear = useGuardedCallback(canClear, runClear);
    const label = intl.formatMessage({ id: "reset" });

    return useMemo(() => ({ ...context, label, isDisabled, onClear }), [context, label, isDisabled, onClear]);
}

/**
 * Default of the Clear slot.
 */
export function DefaultClear({ label, isDisabled, onClear }: IAnalyticalDesignerClearProps) {
    return (
        <Button
            value={label}
            className="gd-button-secondary reset s-reset-report editor-header-item"
            disabled={isDisabled}
            onClick={onClear}
        />
    );
}
