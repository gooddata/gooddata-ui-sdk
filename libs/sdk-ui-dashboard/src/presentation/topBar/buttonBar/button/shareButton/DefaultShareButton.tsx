// (C) 2021-2025 GoodData Corporation
import React, { ReactElement, useCallback } from "react";
import { useIntl } from "react-intl";
import { Button, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { IShareButtonProps } from "./types.js";
import {
    uiActions,
    selectIsShareButtonVisible,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { HiddenShareButton } from "./HiddenShareButton.js";

/**
 * @internal
 */
export function useShareButtonProps(): IShareButtonProps {
    const dispatch = useDashboardDispatch();
    const onShareButtonClick = useCallback(() => dispatch(uiActions.openShareDialog()), [dispatch]);
    const isVisible = useDashboardSelector(selectIsShareButtonVisible);

    return {
        isVisible,
        onShareButtonClick,
    };
}

/**
 * @alpha
 */
export const DefaultShareButton: React.FC<IShareButtonProps> = ({
    isVisible,
    onShareButtonClick,
}): ReactElement | null => {
    const intl = useIntl();
    const tooltipText = intl.formatMessage({ id: "share.button.tooltip" });
    const shareTooltipId = useIdPrefixed("share-tooltip");

    if (!isVisible) {
        return <HiddenShareButton />;
    }

    return (
        <UiTooltip
            id={shareTooltipId}
            arrowPlacement="top-end"
            content={tooltipText}
            anchor={
                <Button
                    onClick={() => onShareButtonClick()}
                    value={intl.formatMessage({ id: "share.button.text" })}
                    className={
                        "gd-button-secondary dash-header-share-button s-header-share-button gd-button gd-icon-users"
                    }
                    accessibilityConfig={{ ariaLabel: tooltipText, ariaDescribedBy: shareTooltipId }}
                />
            }
            triggerBy={["hover", "focus"]}
        />
    );
};
