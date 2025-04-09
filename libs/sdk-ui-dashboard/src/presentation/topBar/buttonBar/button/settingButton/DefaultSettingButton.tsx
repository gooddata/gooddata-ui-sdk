// (C) 2021-2025 GoodData Corporation

import React, { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button, useMediaQuery } from "@gooddata/sdk-ui-kit";

import {
    uiActions,
    selectIsDashboardSaving,
    selectIsInEditMode,
    useDashboardSelector,
    useDashboardDispatch,
} from "../../../../../model/index.js";
import { messages } from "../../../../../locales.js";

import { ISettingButtonProps } from "./types.js";

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
    buttonValue,
    onSettingClick,
}: ISettingButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <BubbleHoverTrigger>
            <Button
                className="gd-button-secondary setting-button s-setting_button gd-icon-settings"
                value={intl.formatMessage(buttonValue)}
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
