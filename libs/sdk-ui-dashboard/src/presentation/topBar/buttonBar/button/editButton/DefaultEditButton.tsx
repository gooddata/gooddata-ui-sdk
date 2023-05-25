// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button, useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    selectIsDashboardLoading,
    selectIsInEditMode,
    switchToEditRenderMode,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { selectCanEnterEditMode } from "../selectors.js";
import { IEditButtonProps } from "./types.js";

/**
 * @internal
 */
export function useEditButtonProps(): IEditButtonProps {
    const minWidthForEditing = useMediaQuery(">=xl");

    const canEnterEdit = useDashboardSelector(selectCanEnterEditMode);
    const isDashboardLoading = useDashboardSelector(selectIsDashboardLoading);
    const isEditing = useDashboardSelector(selectIsInEditMode);

    const dispatch = useDashboardDispatch();
    const onEditClick = useCallback(() => dispatch(switchToEditRenderMode()), [dispatch]);

    return {
        isVisible: minWidthForEditing && !isEditing && canEnterEdit,
        isEnabled: !isDashboardLoading,
        onEditClick,
    };
}

/**
 * @internal
 */
export function DefaultEditButton({ isVisible, isEnabled, onEditClick }: IEditButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            className="gd-button-action gd-icon-pencil s-edit_button"
            value={intl.formatMessage({ id: "controlButtons.edit.value" })}
            disabled={!isEnabled}
            onClick={onEditClick}
        />
    );
}
