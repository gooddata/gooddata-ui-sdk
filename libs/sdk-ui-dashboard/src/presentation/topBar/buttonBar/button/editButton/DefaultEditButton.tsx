// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { Button, UiTooltip, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { type IEditButtonProps } from "./types.js";
import { switchToEditRenderMode } from "../../../../../model/commands/renderMode.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectCatalogIsLoaded } from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectIsDashboardLoading } from "../../../../../model/store/loading/loadingSelectors.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { selectCanEnterEditMode } from "../../../../../model/store/topBar/topBarSelectors.js";
import { selectExecutionTimestamp } from "../../../../../model/store/ui/uiSelectors.js";

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
        <UiTooltip
            arrowPlacement="top-end"
            content={tooltipText}
            anchor={
                <Button
                    className="gd-button-action dash-header-edit-button gd-icon-pencil s-edit_button"
                    value={intl.formatMessage({ id: "controlButtons.edit.value" })}
                    disabled={!isEnabled}
                    onClick={onEditClick}
                    accessibilityConfig={{
                        ariaLabel: tooltipText,
                    }}
                />
            }
            triggerBy={["hover", "focus"]}
        />
    );
}
