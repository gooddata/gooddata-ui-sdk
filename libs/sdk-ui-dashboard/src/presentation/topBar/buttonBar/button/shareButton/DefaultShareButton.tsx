// (C) 2021-2025 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";

import { IShareButtonProps } from "./types.js";
import {
    uiActions,
    selectIsShareButtonVisible,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { HiddenShareButton } from "./HiddenShareButton.js";
import { useDashboardSearchParams } from "../../../../dashboard/hooks/useDashboardUrlParams.js";

const ALIGN_POINTS_TOOLTIP = [{ align: "bc tr" }];

/**
 * @internal
 */
export function useShareButtonProps(): IShareButtonProps {
    const dispatch = useDashboardDispatch();
    const { isDashboardShareButtonDisabledFromUrl } = useDashboardSearchParams();
    const onShareButtonClick = useCallback(() => dispatch(uiActions.openShareDialog()), [dispatch]);
    const isVisible =
        useDashboardSelector(selectIsShareButtonVisible) && !isDashboardShareButtonDisabledFromUrl;

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
}): JSX.Element | null => {
    const intl = useIntl();
    const tooltipText = intl.formatMessage({ id: "share.button.tooltip" });

    if (!isVisible) {
        return <HiddenShareButton />;
    }

    return (
        <BubbleHoverTrigger showDelay={100}>
            <Button
                onClick={() => onShareButtonClick()}
                value={intl.formatMessage({ id: "share.button.text" })}
                className={
                    "gd-button-secondary dash-header-share-button s-header-share-button gd-button gd-icon-users"
                }
                accessibilityConfig={{ ariaLabel: tooltipText }}
            />
            <Bubble alignTo="gd-button-secondary dash-header-share-button" alignPoints={ALIGN_POINTS_TOOLTIP}>
                {tooltipText}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
