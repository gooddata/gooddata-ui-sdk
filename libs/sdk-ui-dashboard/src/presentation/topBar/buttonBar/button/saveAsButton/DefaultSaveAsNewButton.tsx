// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/react/DashboardStoreProvider.js";
import { selectIsAiGenerating } from "../../../../../model/store/config/configSelectors.js";
import { selectIsSaveAsNewButtonVisible } from "../../../../../model/store/topBar/topBarSelectors.js";
import { uiActions } from "../../../../../model/store/ui/index.js";
import { selectDashboardDensity } from "../../../../../model/store/ui/uiSelectors.js";

import { type ISaveAsNewButtonProps } from "./types.js";

/**
 * @internal
 */
export function useSaveAsNewButtonProps(): ISaveAsNewButtonProps {
    const dashboardDispatch = useDashboardDispatch();
    const isVisible = useDashboardSelector(selectIsSaveAsNewButtonVisible);
    const isAiGenerating = useDashboardSelector(selectIsAiGenerating);

    const onSaveAsNewClick = useCallback(() => {
        dashboardDispatch(uiActions.openSaveAsDialog());
    }, [dashboardDispatch]);

    return {
        isVisible,
        isEnabled: !isAiGenerating,
        onSaveAsNewClick,
    };
}

/**
 * @internal
 */
export function DefaultSaveAsNewButton({ isVisible, isEnabled, onSaveAsNewClick }: ISaveAsNewButtonProps) {
    const intl = useIntl();
    const density = useDashboardSelector(selectDashboardDensity);

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            className={cx("gd-button-secondary s-save_as_new_button", {
                "gd-button-small": density === "compact",
            })}
            value={intl.formatMessage({ id: "save.as.new" })}
            onClick={onSaveAsNewClick}
            disabled={!isEnabled}
            accessibilityConfig={{
                popupType: "dialog",
                popupId: "save-as-new-dialog",
            }}
        />
    );
}
