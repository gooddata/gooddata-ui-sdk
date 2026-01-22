// (C) 2021-2026 GoodData Corporation

import { type ReactElement, useCallback } from "react";

import { useIntl } from "react-intl";

import { Button, UiTooltip } from "@gooddata/sdk-ui-kit";

import { HiddenShareButton } from "./HiddenShareButton.js";
import { type IShareButtonProps } from "./types.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectIsShareButtonVisible } from "../../../../../model/store/topBar/topBarSelectors.js";
import { uiActions } from "../../../../../model/store/ui/index.js";

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
export function DefaultShareButton({
    isVisible,
    onShareButtonClick,
}: IShareButtonProps): ReactElement | null {
    const intl = useIntl();
    const tooltipText = intl.formatMessage({ id: "share.button.tooltip" });

    if (!isVisible) {
        return <HiddenShareButton />;
    }

    return (
        <UiTooltip
            arrowPlacement="top-end"
            content={tooltipText}
            anchor={
                <Button
                    onClick={() => onShareButtonClick()}
                    value={intl.formatMessage({ id: "share.button.text" })}
                    className={
                        "gd-button-secondary dash-header-share-button s-header-share-button gd-button gd-icon-users"
                    }
                    accessibilityConfig={{
                        ariaLabel: tooltipText,
                        popupType: "dialog",
                        popupId: "share-dialog",
                    }}
                />
            }
            triggerBy={["hover", "focus"]}
        />
    );
}
