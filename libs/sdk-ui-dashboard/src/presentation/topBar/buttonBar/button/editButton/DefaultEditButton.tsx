// (C) 2022-2025 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button, useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    selectIsDashboardLoading,
    selectIsInEditMode,
    selectCatalogIsLoaded,
    switchToEditRenderMode,
    useDashboardDispatch,
    useDashboardSelector,
    selectCanEnterEditMode,
    selectExecutionTimestamp,
} from "../../../../../model/index.js";

import { IEditButtonProps } from "./types.js";

const ALIGN_POINTS_TOOLTIP = [{ align: "bc tr" }];

/**
 * @internal
 */
export function useEditButtonProps(): IEditButtonProps {
    const minWidthForEditing = useMediaQuery(">=xl");
    const intl = useIntl();

    const canEnterEdit = useDashboardSelector(selectCanEnterEditMode);
    const isDashboardLoading = useDashboardSelector(selectIsDashboardLoading);
    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isExecutionTimestampMode = useDashboardSelector(selectExecutionTimestamp);

    const dispatch = useDashboardDispatch();
    const onEditClick = useCallback(() => dispatch(switchToEditRenderMode()), [dispatch]);

    const tooltipText = isExecutionTimestampMode
        ? intl.formatMessage({ id: "controlButtons.edit.executionTimestampMode.tooltip" })
        : intl.formatMessage({ id: "controlButtons.edit.tooltip" });

    return {
        isVisible: minWidthForEditing && !isEditing && canEnterEdit,
        isEnabled: !isDashboardLoading && isCatalogLoaded && !isExecutionTimestampMode,
        onEditClick,
        tooltipText,
    };
}

/**
 * @internal
 */
export function DefaultEditButton({ isVisible, isEnabled, onEditClick, tooltipText }: IEditButtonProps) {
    const intl = useIntl();

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
                accessibilityConfig={{
                    ariaLabel: tooltipText,
                }}
            />
            <Bubble alignTo="gd-button-action dash-header-edit-button" alignPoints={ALIGN_POINTS_TOOLTIP}>
                {tooltipText}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
