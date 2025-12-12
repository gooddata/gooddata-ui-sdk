// (C) 2021-2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { type ICancelButtonProps } from "./types.js";
import {
    cancelEditRenderMode,
    selectIsDashboardDirty,
    selectIsDashboardSaving,
    selectIsInEditMode,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";

/**
 * @internal
 */
export function useCancelButtonProps(): ICancelButtonProps {
    const dispatch = useDashboardDispatch();
    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isSaving = useDashboardSelector(selectIsDashboardSaving);

    const isDirty = useDashboardSelector(selectIsDashboardDirty);

    const onCancelClick = useCallback(() => {
        if (isDirty) {
            dispatch(uiActions.openCancelEditModeDialog());
        } else {
            dispatch(cancelEditRenderMode());
        }
    }, [dispatch, isDirty]);

    return {
        isVisible: isEditing && !isSaving,
        onCancelClick,
    };
}

/**
 * @internal
 */
export function DefaultCancelButton({ isVisible, onCancelClick }: ICancelButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            className="gd-button-secondary cancel-button s-cancel_button"
            value={intl.formatMessage({ id: "cancel" })}
            onClick={onCancelClick}
        />
    );
}
