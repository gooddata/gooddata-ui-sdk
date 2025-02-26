// (C) 2021-2025 GoodData Corporation

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";
import {
    uiActions,
    selectIsSaveAsNewButtonVisible,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../../model/index.js";

import { ISaveAsNewButtonProps } from "./types.js";

/**
 * @internal
 */
export function useSaveAsNewButtonProps(): ISaveAsNewButtonProps {
    const dashboardDispatch = useDashboardDispatch();
    const isVisible = useDashboardSelector(selectIsSaveAsNewButtonVisible);

    const onSaveAsNewClick = useCallback(() => {
        dashboardDispatch(uiActions.openSaveAsDialog());
    }, [dashboardDispatch]);

    return {
        isVisible,
        onSaveAsNewClick,
    };
}

/**
 * @internal
 */
export function DefaultSaveAsNewButton({ isVisible, onSaveAsNewClick }: ISaveAsNewButtonProps) {
    const intl = useIntl();

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            className="gd-button-secondary s-save_as_new_button"
            value={intl.formatMessage({ id: "save.as.new" })}
            onClick={onSaveAsNewClick}
        />
    );
}
