// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, Button, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { type ISettingButtonProps } from "./types.js";
import { messages } from "../../../../../locales.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { selectIsDashboardSaving } from "../../../../../model/store/saving/savingSelectors.js";
import { uiActions } from "../../../../../model/store/ui/index.js";

/**
 * @internal
 */
export function useSettingButtonProps(): ISettingButtonProps {
    const isSmall = useMediaQuery("<=md");
    const dispatch = useDashboardDispatch();
    const onSettingClick = useCallback(() => dispatch(uiActions.openSettingsDialog()), [dispatch]);

    const isEditing = useDashboardSelector(selectIsInEditMode);
    const isSaving = useDashboardSelector(selectIsDashboardSaving);

    const isVisible = isEditing && !isSmall;
    const isEnabled = true;

    const buttonValue = messages.controlButtonsSettingValue;
    const buttonTitle = messages.controlButtonsSettingTitle;

    return {
        isVisible,
        isEnabled,
        isSaving,
        buttonValue,
        buttonTitle,
        onSettingClick,
    };
}

/**
 * @internal
 */
export function DefaultSettingButton({
    isVisible,
    isEnabled,
    isSaving,
    buttonTitle,
    onSettingClick,
}: ISettingButtonProps) {
    if (!isVisible) {
        return null;
    }

    return (
        <BubbleHoverTrigger>
            <Button
                className="gd-button-secondary gd-button-icon-only setting-button s-setting_button gd-icon-settings"
                onClick={onSettingClick}
                disabled={!isEnabled || isSaving}
            />
            <Bubble
                alignPoints={[{ align: "bc tr" }]}
                arrowOffsets={{ "bc tr": [10, 20] }}
                alignTo={`.setting-button`}
            >
                <FormattedMessage {...buttonTitle} />
            </Bubble>
        </BubbleHoverTrigger>
    );
}
