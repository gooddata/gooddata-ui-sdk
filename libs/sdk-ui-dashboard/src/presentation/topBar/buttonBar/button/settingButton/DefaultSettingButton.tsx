// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiIconButton, UiTooltip, useMediaQuery } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../../locales.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { selectIsDashboardSaving } from "../../../../../model/store/saving/savingSelectors.js";
import { uiActions } from "../../../../../model/store/ui/index.js";

import { type ISettingButtonProps } from "./types.js";

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
        <UiTooltip
            arrowPlacement="top-end"
            content={<FormattedMessage {...buttonTitle} />}
            width={300}
            anchor={
                <UiIconButton
                    onClick={onSettingClick}
                    isDisabled={!isEnabled || isSaving}
                    icon="settings"
                    accessibilityConfig={{ ariaLabel: intl.formatMessage(buttonValue) }}
                />
            }
            triggerBy={["hover", "focus"]}
        />
    );
}
