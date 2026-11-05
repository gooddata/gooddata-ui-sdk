// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "@gooddata/sdk-ui-kit";

import { cancelEditFromKDAction } from "../../actions/cancel_edit_from_kd_actions.js";
import {
    type IAnalyticalDesignerCancelProps,
    type IAnalyticalDesignerHeaderContext,
} from "../../embedding/editorHeaderSlotTypes.js";
import { isNavigationDisabled } from "../../selectors/editor_header_selector.js";
import { type AppDispatch, type IAppState } from "../../store/types.js";

import { useGuardedCallback } from "./editorHeaderContext.js";

const canNavigate = (state: IAppState) => !isNavigationDisabled(state);
const runCancellation = (dispatch: AppDispatch) => dispatch(cancelEditFromKDAction());

/**
 * Requests leaving the editor through the cancellation flow that `IAnalyticalDesignerApi.requestCancellation()`
 * starts too: a confirmation when there are unsaved changes, then the `insightEditingCancelled` event. Unlike
 * that command, it is refused while the visualization is being saved.
 */
export function useRequestCancellation(): () => void {
    return useGuardedCallback(canNavigate, runCancellation);
}

export function useCancelProps(context: IAnalyticalDesignerHeaderContext): IAnalyticalDesignerCancelProps {
    const intl = useIntl();
    const isDisabled = useSelector(isNavigationDisabled);
    const onCancel = useRequestCancellation();
    const label = intl.formatMessage({ id: "cancel" });

    return useMemo(
        () => ({ ...context, label, isDisabled, onCancel }),
        [context, label, isDisabled, onCancel],
    );
}

/**
 * Default of the Cancel slot.
 */
export function DefaultCancel({ label, isDisabled, onCancel }: IAnalyticalDesignerCancelProps) {
    return (
        <Button
            value={label}
            className="gd-button-secondary cancel-edit-from-kd s-cancel-edit-from-kd editor-header-item"
            disabled={isDisabled}
            onClick={onCancel}
        />
    );
}
