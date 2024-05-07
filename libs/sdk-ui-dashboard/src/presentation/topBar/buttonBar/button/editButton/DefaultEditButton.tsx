// (C) 2022-2024 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button, useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    selectIsDashboardLoading,
    selectIsInEditMode,
    switchToEditRenderMode,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { selectCanEnterEditMode } from "../selectors.js";
import { IEditButtonProps } from "./types.js";

const ALIGN_POINTS_TOOLTIP = [{ align: "bc tr" }];

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
    const tooltipText = intl.formatMessage({ id: "controlButtons.edit.tooltip" });

    if (!isVisible) {
        return null;
    }

    return (
        <BubbleHoverTrigger showDelay={100}>
            <Button
                className="gd-button-action dash-header-edit-button gd-icon-pencil s-edit_button"
                value={intl.formatMessage({ id: "controlButtons.edit.value" })}
                disabled={!isEnabled}
                onClick={onEditClick}
                ariaLabel={tooltipText}
            />
            <Bubble alignTo="gd-button-action dash-header-edit-button" alignPoints={ALIGN_POINTS_TOOLTIP}>
                {tooltipText}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
