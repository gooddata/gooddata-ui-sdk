// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import {
    cancelEditRenderMode,
    selectIsDashboardSaving,
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model";
import { ICancelButtonProps } from "./types";

/**
 * @internal
 */
export function useCancelButtonProps(): ICancelButtonProps {
    const dispatch = useDashboardDispatch();
    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isSaving = useDashboardSelector(selectIsDashboardSaving);

    const onCancelClick = useCallback(() => dispatch(cancelEditRenderMode()), [dispatch]);

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
