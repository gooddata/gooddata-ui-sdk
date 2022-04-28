// (C) 2021-2022 GoodData Corporation
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import { IShareButtonProps } from "./types";
import { uiActions, useDashboardDispatch, useDashboardSelector } from "../../../../../model";
import { HiddenShareButton } from "./HiddenShareButton";
import { selectIsShareButtonVisible } from "../selectors";

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
}): JSX.Element | null => {
    const intl = useIntl();

    if (!isVisible) {
        return <HiddenShareButton />;
    }

    return (
        <>
            <Button
                onClick={() => onShareButtonClick()}
                value={intl.formatMessage({ id: "share.button.text" })}
                className={
                    "gd-button-secondary dash-header-share-button s-header-share-button gd-button gd-icon-users"
                }
            />
        </>
    );
};
